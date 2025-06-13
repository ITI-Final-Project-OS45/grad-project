/**
 * API Client Configuration and Utilities
 * ====================================
 *
 * This module provides a comprehensive API client setup with authentication,
 * error handling, and utilities for both client-side and server-side requests.
 *
 * ## Key Features:
 * - Automatic token management with cookies
 * - Request/response logging in development
 * - Automatic retry on auth failures
 * - File upload/download support
 * - Server-side API support for Next.js actions
 * - TanStack Query keys factory
 *
 * ## Configuration:
 * - Base URL: NEXT_PUBLIC_API_URL (defaults to http://localhost:8080)
 * - Timeout: 30 seconds
 * - Cookies: 7-day expiry, secure in production
 * - CORS: Credentials included
 *
 * ## Main Exports:
 *
 * ### 1. tokenManager
 * Handles authentication token storage in cookies:
 * ```typescript
 * tokenManager.setToken("your-jwt-token");
 * const token = tokenManager.getToken();
 * tokenManager.clearToken();
 * const isLoggedIn = tokenManager.isAuthenticated();
 * ```
 *
 * ### 2. apiClient (Client-side API calls)
 * Main API client for browser-based requests:
 * ```typescript
 *  GET request
 * const users = await apiClient.get<User[]>("/api/users");
 *
 * POST request
 * const newUser = await apiClient.post<User>("/api/users", {
 *   name: "John Doe",
 *   email: "john@example.com"
 * });
 *
 * File upload with progress
 * const formData = new FormData();
 * formData.append("file", file);
 * await apiClient.upload("/api/upload", formData, (progress) => {
 *   console.log(`Upload: ${Math.round(progress.loaded / progress.total * 100)}%`);
 * });
 *
 *  File download
 * await apiClient.download("/api/files/report.pdf", "my-report.pdf");
 * ```
 *
 * ### 3. serverApi (Server-side API calls)
 * For Next.js server actions and API routes:
 * ```typescript
 *  In a server action
 * "use server";
 *
 * const data = await serverApi.get("/api/protected-resource", {
 *   token: "optional-token-override"
 * });
 * ```
 *
 * ### 4. queryKeys
 * Structured keys for TanStack Query caching:
 * ```typescript
 * Use in React Query
 * const { data } = useQuery({
 *   queryKey: queryKeys.project("123"),
 *   queryFn: () => apiClient.get(`/api/projects/123`)
 * });
 * ```
 *
 * ## Error Handling:
 * - 401 errors automatically clear tokens and redirect to /signin
 * - Network errors are transformed to user-friendly messages
 * - All errors include status codes and structured error details
 *
 * ## Security Features:
 * - Automatic Bearer token injection
 * - Secure cookie settings in production
 * - Request/response logging only in development
 * - CSRF protection with SameSite cookies
 *
 * @author Mohamed Hesham
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { ApiResponse, ApiError } from "@repo/types";

// Base URL configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Cookie configuration
const TOKEN_COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  expires: 7, // 7 days
};

// Create axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor for adding auth tokens and request logging
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token from cookies
    const token = Cookies.get(TOKEN_COOKIE_NAME);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: Date.now() };

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      const duration = Date.now() - (response.config.metadata?.startTime ?? Date.now());
      console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url} - ${duration}ms`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error(`❌ [${originalRequest?.method?.toUpperCase()}] ${originalRequest?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - Clear token and redirect
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear invalid token
      tokenManager.clearToken();

      // Redirect to login on client-side
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
    }

    // Handle network errors
    if (!error.response) {
      const networkError = new Error("Network error - please check your connection");
      return Promise.reject(networkError);
    }

    // Transform error for consistent handling
    const transformedError = new Error(error.response.data?.message ?? error.message ?? "An unexpected error occurred");
    Object.assign(transformedError, {
      status: error.response.status,
      code: error.response.data?.code ?? "UNKNOWN_ERROR",
      details: error.response.data?.details,
    });

    return Promise.reject(transformedError);
  }
);

// API wrapper functions for different HTTP methods
export const apiClient = {
  // GET request
  get: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T, ApiError>> => {
    const response = await api.get(url, config);
    return response.data;
  },

  // POST request
  post: async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T, ApiError>> => {
    const response = await api.post(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T, ApiError>> => {
    const response = await api.put(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T, ApiError>> => {
    const response = await api.patch(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T, ApiError>> => {
    const response = await api.delete(url, config);
    return response.data;
  },

  // File upload with progress
  upload: async <T = unknown>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: import("axios").AxiosProgressEvent) => void
  ): Promise<ApiResponse<T, ApiError>> => {
    const response = await api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Download file
  download: async (url: string, filename?: string): Promise<void> => {
    const response = await api.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename ?? "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Server-side API functions for use with "use server"
export const serverApi = {
  // GET request for server actions
  get: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};

    const headers = {
      ...axiosConfig.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await api.get(url, { ...axiosConfig, headers });
    return response.data;
  },

  // POST request for server actions
  post: async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};

    const headers = {
      ...axiosConfig.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await api.post(url, data, { ...axiosConfig, headers });
    return response.data;
  },

  // PUT request for server actions
  put: async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};

    const headers = {
      ...axiosConfig.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await api.put(url, data, { ...axiosConfig, headers });
    return response.data;
  },

  // PATCH request for server actions
  patch: async <T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};

    const headers = {
      ...axiosConfig.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await api.patch(url, data, { ...axiosConfig, headers });
    return response.data;
  },

  // DELETE request for server actions
  delete: async <T = unknown>(
    url: string,
    config?: AxiosRequestConfig & { token?: string }
  ): Promise<ApiResponse<T, ApiError>> => {
    const { token, ...axiosConfig } = config ?? {};

    const headers = {
      ...axiosConfig.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await api.delete(url, { ...axiosConfig, headers });
    return response.data;
  },
};

// Utility functions for token management with cookies
export const tokenManager = {
  setToken: (token: string) => {
    Cookies.set(TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
  },

  getToken: (): string | undefined => {
    return Cookies.get(TOKEN_COOKIE_NAME);
  },

  clearToken: () => {
    Cookies.remove(TOKEN_COOKIE_NAME);
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  },
};

// Query keys factory for TanStack React Query
export const queryKeys = {
  all: ["api"] as const,

  // Auth
  auth: () => [...queryKeys.all, "auth"] as const,
  currentUser: () => [...queryKeys.auth(), "user"] as const,
  profile: () => [...queryKeys.auth(), "profile"] as const,

  // Projects
  projects: () => [...queryKeys.all, "projects"] as const,
  project: (id: string) => [...queryKeys.projects(), id] as const,
  projectMembers: (id: string) => [...queryKeys.project(id), "members"] as const,
  projectTasks: (id: string) => [...queryKeys.project(id), "tasks"] as const,

  // Tasks
  tasks: () => [...queryKeys.all, "tasks"] as const,
  task: (id: string) => [...queryKeys.tasks(), id] as const,

  // Users
  users: () => [...queryKeys.all, "users"] as const,
  user: (id: string) => [...queryKeys.users(), id] as const,

  // Organizations
  organizations: () => [...queryKeys.all, "organizations"] as const,
  organization: (id: string) => [...queryKeys.organizations(), id] as const,
};

// Type declarations for axios extensions
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
    _retry?: boolean;
  }
}

// Default export
export default api;
