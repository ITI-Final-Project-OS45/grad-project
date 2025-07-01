/**
 * Enhanced API Client for Next.js Applications
 * ===========================================
 *
 * A comprehensive API client with first-class support for:
 * - React Server Components (RSC)
 * - React Client Components (RCC)
 * - Server Actions
 * - Automatic token refresh
 * - Type-safe responses
 */

import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ApiResponse, ApiError } from "@repo/types";
import { tokenManager } from "./token";
import { getErrorCodeFromStatus } from "./utils";

// Environment detection
const isServer = typeof window === "undefined";
const isDev = process.env.NODE_ENV === "development";

// Base URL configuration with API prefix
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080") + "/api/v1";

// Type definitions for enhanced functionality
interface EnhancedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: {
    startTime: number;
    retryCount?: number;
  };
  _retry?: boolean;
  _isRefreshing?: boolean;
}

// Token refresh state management
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

/**
 * Subscribe to token refresh
 * @param callback Function to call when token is refreshed
 */
function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers that token has been refreshed
 * @param token New access token
 */
function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

/**
 * Create and configure an axios instance
 * @param options Configuration options
 * @returns Configured axios instance
 */
function createAxiosInstance(
  options: {
    withCredentials?: boolean;
    isServerSide?: boolean;
  } = {}
): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: options.withCredentials ?? true,
  });

  // Request interceptor
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
      const enhancedConfig = config as EnhancedAxiosRequestConfig;

      // Don't add auth token for refresh token requests
      if (enhancedConfig.url?.includes("/auth/refresh")) {
        return enhancedConfig;
      }

      // Proactively check and refresh token if expiring soon (client-side only)
      if (!options.isServerSide && tokenManager.isAuthenticated()) {
        if (tokenManager.isTokenExpiringSoon(1)) {
          // 1 minute buffer
          try {
            const refreshTokenValue = tokenManager.getRefreshToken();
            if (refreshTokenValue) {
              console.log("🔄 Proactive token refresh before API call...");
              const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                refreshToken: refreshTokenValue,
              });

              if (response.data?.success && response.data?.data) {
                tokenManager.setTokens(response.data.data.accessToken, response.data.data.refreshToken);
                console.log("✅ Proactive token refresh successful");
              }
            }
          } catch (error) {
            console.error("❌ Proactive token refresh failed:", error);
            // Continue with the request anyway, let the response interceptor handle it
          }
        }
      }

      // Add auth token from cookies (client-side) or from config (server-side)
      if (!options.isServerSide) {
        const token = tokenManager.getAccessToken();
        if (token && enhancedConfig.headers) {
          enhancedConfig.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Add request timestamp for debugging and metrics
      enhancedConfig.metadata = {
        startTime: Date.now(),
        retryCount: enhancedConfig.metadata?.retryCount ?? 0,
      };

      // Log request in development
      if (isDev) {
        console.log(`🚀 [${enhancedConfig.method?.toUpperCase()}] ${enhancedConfig.url}`, {
          data: enhancedConfig.data,
          params: enhancedConfig.params,
        });
      }

      return enhancedConfig;
    },
    (error: AxiosError): Promise<AxiosError> => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
      // Log response in development
      if (isDev) {
        const enhancedConfig = response.config as EnhancedAxiosRequestConfig;
        const duration = Date.now() - (enhancedConfig.metadata?.startTime ?? Date.now());
        console.log(`✅ [${enhancedConfig.method?.toUpperCase()}] ${enhancedConfig.url} - ${duration}ms`, {
          status: response.status,
          data: response.data,
        });
      }

      return response;
    },
    async (error: AxiosError): Promise<any> => {
      const originalRequest = error.config as EnhancedAxiosRequestConfig;

      // Log error in development
      if (isDev) {
        console.error(`❌ [${originalRequest?.method?.toUpperCase()}] ${originalRequest?.url}`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });
      }

      // Skip token refresh on server-side or for refresh token requests
      if (options.isServerSide || originalRequest?.url?.includes("/auth/refresh")) {
        return Promise.reject(transformApiError(error));
      }

      // Handle 401 Unauthorized with token refresh
      if (error.response?.status === 401 && !originalRequest?._retry) {
        // If we're already refreshing, wait for the new token
        if (isRefreshing) {
          try {
            // Wait for token refresh to complete
            const newToken = await new Promise<string>((resolve, reject) => {
              subscribeTokenRefresh((token) => {
                resolve(token);
              });

              // Add a timeout to prevent hanging indefinitely
              setTimeout(() => {
                reject(new Error("Token refresh timeout"));
              }, 10000); // 10 second timeout
            });

            // Update the request with new token and retry
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          } catch (error) {
            // Log the error and continue with rejection
            console.error("Error while waiting for token refresh:", error);
            return Promise.reject(transformApiError(error));
          }
        }

        // Start token refresh process
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Get refresh token
          const refreshToken = tokenManager.getRefreshToken();
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          // Attempt to refresh the token
          const response = await instance.post("/auth/refresh", { refreshToken });

          if (response.data?.success && response.data?.data) {
            // Update tokens - use the correct response structure
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            tokenManager.setTokens(accessToken, newRefreshToken);

            // Update Authorization header for the original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Notify all pending requests
            onTokenRefreshed(accessToken);

            // Reset refreshing state
            isRefreshing = false;

            // Retry the original request
            return instance(originalRequest);
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (error) {
          // Reset refreshing state
          isRefreshing = false;

          // Log the error
          console.error("Token refresh failed:", error);

          // Clear tokens and redirect on client-side
          if (!isServer) {
            tokenManager.clearTokens();
            window.location.href = "/signin";
          }

          return Promise.reject(transformApiError(error));
        }
      }

      // Handle network errors
      if (!error.response) {
        const networkError = new Error("Network error - please check your connection");
        return Promise.reject(networkError);
      }

      // Transform error for consistent handling
      return Promise.reject(transformApiError(error));
    }
  );

  return instance;
}

// Create singleton instances
// Client-side instance (with credentials)
let clientInstance: AxiosInstance;
// Server-side instance (without credentials by default)
let serverInstance: AxiosInstance;

/**
 * Get the appropriate axios instance based on environment
 * @param isServerSide Whether to use server-side instance
 * @returns Axios instance
 */
function getInstance(isServerSide = isServer): AxiosInstance {
  if (isServerSide) {
    if (!serverInstance) {
      serverInstance = createAxiosInstance({
        withCredentials: false,
        isServerSide: true,
      });
    }
    return serverInstance;
  }

  if (!clientInstance) {
    clientInstance = createAxiosInstance({
      withCredentials: true,
      isServerSide: false,
    });
  }
  return clientInstance;
}

/**
 * Transform API errors into a consistent format
 * @param error Axios error or regular Error
 * @returns Transformed error
 */
function transformApiError(error: unknown): Error {
  // Create a base error object
  let transformedError: Error & {
    status?: number;
    code?: string;
    details?: unknown;
    apiResponse?: Record<string, any>;
  };

  // Handle AxiosError
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const errorData = axiosError.response?.data as unknown;

    if (errorData && typeof errorData === "object") {
      const errorObj = errorData as Record<string, any>;

      // Check if it's already in ApiResponse error format
      if ("success" in errorObj && errorObj.success === false) {
        // Already in your ApiResponse error format
        transformedError = new Error(errorObj.message ?? "An error occurred");
        Object.assign(transformedError, {
          status: axiosError.response?.status,
          code: errorObj.error?.code ?? "UNKNOWN_ERROR",
          details: errorObj.error?.details,
          apiResponse: errorObj, // Preserve the full API response
        });
      } else {
        // Standard NestJS exception format
        const message = errorObj.message ?? axiosError.message ?? "An unexpected error occurred";
        transformedError = new Error(Array.isArray(message) ? message[0] : message);
        Object.assign(transformedError, {
          status: axiosError.response?.status,
          code: errorObj.error ?? getErrorCodeFromStatus(axiosError.response?.status ?? 500),
          details: errorObj,
        });
      }
    } else {
      // Fallback for any other error format
      transformedError = new Error(axiosError.message ?? "An unexpected error occurred");
      Object.assign(transformedError, {
        status: axiosError.response?.status,
        code: getErrorCodeFromStatus(axiosError.response?.status ?? 500),
        details: errorData,
      });
    }
  } else if (error instanceof Error) {
    // Handle regular Error objects
    transformedError = error;
    Object.assign(transformedError, {
      status: 500,
      code: "UNKNOWN_ERROR",
    });
  } else {
    // Handle unknown error types
    transformedError = new Error("An unknown error occurred");
    Object.assign(transformedError, {
      status: 500,
      code: "UNKNOWN_ERROR",
      details: error,
    });
  }

  return transformedError;
}

// Type for API client methods
type ApiClientMethod<T = unknown, D = unknown> = (
  url: string,
  data?: D,
  config?: AxiosRequestConfig
) => Promise<ApiResponse<T, ApiError>>;

// Type for API client GET/DELETE methods
type ApiClientGetMethod<T = unknown> = (url: string, config?: AxiosRequestConfig) => Promise<ApiResponse<T, ApiError>>;

// Type for API client upload method
type ApiClientUploadMethod<T = unknown> = (
  url: string,
  formData: FormData,
  onUploadProgress?: (progressEvent: import("axios").AxiosProgressEvent) => void
) => Promise<ApiResponse<T, ApiError>>;

// Type for server API methods with token option
type ServerApiMethod<T = unknown, D = unknown> = (
  url: string,
  data?: D,
  config?: AxiosRequestConfig & { token?: string }
) => Promise<ApiResponse<T, ApiError>>;

// Type for server API GET/DELETE methods with token option
type ServerApiGetMethod<T = unknown> = (
  url: string,
  config?: AxiosRequestConfig & { token?: string }
) => Promise<ApiResponse<T, ApiError>>;

// Client-side API client
export const apiClient = {
  // GET request
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T, ApiError>> => {
    const instance = getInstance(false);
    return instance.get(url, config).then((response) => response.data);
  },

  // POST request
  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T, ApiError>> => {
    const instance = getInstance(false);
    return instance.post(url, data, config).then((response) => response.data);
  },

  // PUT request
  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T, ApiError>> => {
    const instance = getInstance(false);
    return instance.put(url, data, config).then((response) => response.data);
  },

  // PATCH request
  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T, ApiError>> => {
    const instance = getInstance(false);
    return instance.patch(url, data, config).then((response) => response.data);
  },

  // DELETE request
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T, ApiError>> => {
    const instance = getInstance(false);
    return instance.delete(url, config).then((response) => response.data);
  },

  // File upload with progress
  upload: <T = unknown>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: import("axios").AxiosProgressEvent) => void
  ): Promise<ApiResponse<T, ApiError>> => {
    const instance = getInstance(false);
    return instance
      .post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      })
      .then((response) => response.data);
  },
};

// Server-side API client for RSC and Server Actions
export const serverApi = {
  // GET request for server
  get: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};
    const instance = getInstance(true);

    const headers = {
      ...axiosConfig?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return instance.get(url, { ...axiosConfig, headers }).then((response) => response.data);
  },

  // POST request for server
  post: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};
    const instance = getInstance(true);

    const headers = {
      ...axiosConfig?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return instance.post(url, data, { ...axiosConfig, headers }).then((response) => response.data);
  },

  // PUT request for server
  put: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};
    const instance = getInstance(true);

    const headers = {
      ...axiosConfig?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return instance.put(url, data, { ...axiosConfig, headers }).then((response) => response.data);
  },

  // PATCH request for server
  patch: <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};
    const instance = getInstance(true);

    const headers = {
      ...axiosConfig?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return instance.patch(url, data, { ...axiosConfig, headers }).then((response) => response.data);
  },

  // DELETE request for server
  delete: <T = unknown>(
    url: string,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};
    const instance = getInstance(true);

    const headers = {
      ...axiosConfig?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return instance.delete(url, { ...axiosConfig, headers }).then((response) => response.data);
  },
};

// Query keys factory for TanStack Query
export const queryKeys = {
  // Auth endpoints
  auth: {
    current: () => ["auth", "current"] as const,
  },

  // Users endpoints: /api/v1/users/*
  users: {
    lists: () => ["users", "list"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    current: () => ["users", "current"] as const,
  },

  // Workspaces endpoints: /api/v1/workspaces/*
  workspaces: {
    lists: () => ["workspaces", "list"] as const,
    detail: (id: string) => ["workspaces", "detail", id] as const,
  },

  // Invites endpoints: /api/v1/invites/*
  invites: {
    userInvites: () => ["invites", "user"] as const,
    workspaceInvites: (workspaceId: string) => ["invites", "workspace", workspaceId] as const,
    detail: (id: string) => ["invites", "detail", id] as const,
  },

  // Workspace Members endpoints: /api/v1/workspace-member/*
  workspaceMembers: {
    byWorkspace: (workspaceId: string) => ["workspace-members", "workspace", workspaceId] as const,
    detail: (workspaceId: string, memberId: string) => ["workspace-members", "detail", workspaceId, memberId] as const,
  },

  // Releases endpoints: /api/v1/releases/*
  releases: {
    lists: () => ["releases", "list"] as const,
    detail: (id: string) => ["releases", "detail", id] as const,
    byWorkspace: (workspaceId: string) => ["releases", "workspace", workspaceId] as const,
  },

  // Bugs endpoints: /api/v1/bugs/*
  bugs: {
    lists: () => ["bugs", "list"] as const,
    detail: (id: string) => ["bugs", "detail", id] as const,
    byRelease: (releaseId: string) => ["bugs", "release", releaseId] as const,
  },

  // Hotfixes endpoints: /api/v1/hotfixes/*
  hotfixes: {
    lists: () => ["hotfixes", "list"] as const,
    detail: (id: string) => ["hotfixes", "detail", id] as const,
    byRelease: (releaseId: string) => ["hotfixes", "release", releaseId] as const,
  },
} as const;

// Extend axios types
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
      retryCount?: number;
    };
    _retry?: boolean;
    _isRefreshing?: boolean;
  }
}

// Default export
export default getInstance();
