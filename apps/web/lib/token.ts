import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Cookie configuration
const ACCESS_TOKEN_COOKIE_NAME = "auth_token";
const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

// Separate cookie options for access and refresh tokens
const ACCESS_TOKEN_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  expires: 1 / 96,
};

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  expires: 7,
};

// Enhanced token manager with access/refresh token support
const tokenManager = {
  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    Cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  },

  setToken: (token: string) => {
    Cookies.set(ACCESS_TOKEN_COOKIE_NAME, token, ACCESS_TOKEN_COOKIE_OPTIONS);
  },

  getAccessToken: (): string | undefined => {
    return Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
  },

  getRefreshToken: (): string | undefined => {
    return Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
  },

  getToken: (): string | undefined => {
    return Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
  },

  clearTokens: () => {
    Cookies.remove(ACCESS_TOKEN_COOKIE_NAME);
    Cookies.remove(REFRESH_TOKEN_COOKIE_NAME);
  },

  clearToken: () => {
    Cookies.remove(ACCESS_TOKEN_COOKIE_NAME);
    Cookies.remove(REFRESH_TOKEN_COOKIE_NAME);
  },

  isAuthenticated: (): boolean => {
    return !!Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
  },
  getUserId: (): string | undefined => {
    const token = Cookies.get(ACCESS_TOKEN_COOKIE_NAME);
    if (!token) return undefined;

    try {
      const payload = jwtDecode<{ userId?: string; sub?: string }>(token);
      return payload.userId || payload.sub || undefined;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return undefined;
    }
  },

  isTokenExpiringSoon: (bufferMinutes = 2): boolean => {
    const token = tokenManager.getAccessToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      const bufferTime = bufferMinutes * 60 * 1000;

      return expiryTime - now <= bufferTime;
    } catch (error) {
      console.error("Failed to decode token for expiry check:", error);
      return true;
    }
  },

  getTokenTimeLeft: (): number => {
    const token = tokenManager.getAccessToken();
    if (!token) return 0;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      return Math.max(0, expiryTime - now);
    } catch (error) {
      console.error("Failed to get token time left:", error);
      return 0;
    }
  },

  getTokenExpiryDate: (): Date | null => {
    const token = tokenManager.getAccessToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error("Failed to get token expiry date:", error);
      return null;
    }
  },

  // Automatic refresh functionality
  refreshTokenSilently: async (): Promise<boolean> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      console.warn("No refresh token available for silent refresh");
      return false;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.accessToken && data.data?.refreshToken) {
          tokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
          return true;
        }
      }

      console.error("Silent token refresh failed:", response.status);
      return false;
    } catch (error) {
      console.error("Silent token refresh error:", error);
      return false;
    }
  },

  scheduleTokenRefresh: (): NodeJS.Timeout | null => {
    const token = tokenManager.getAccessToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      const refreshTime = expiryTime - 2 * 60 * 1000; // Refresh 2 minutes before expiry

      if (refreshTime > now) {
        const timeout = setTimeout(() => {
          tokenManager.refreshTokenSilently();
        }, refreshTime - now);

        return timeout;
      }

      return null;
    } catch (error) {
      console.error("Failed to schedule token refresh:", error);
      return null;
    }
  },
};

export { tokenManager, ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME };
