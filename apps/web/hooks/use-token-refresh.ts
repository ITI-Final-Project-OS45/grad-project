// hooks/use-token-refresh.ts
import { useEffect, useCallback, useRef } from "react";
import { tokenManager } from "@/lib/token";
import { AuthService } from "@/services/auth.service";

export const useTokenRefresh = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = useCallback(async () => {
    if (!tokenManager.isAuthenticated()) {
      return false;
    }

    const refreshTokenValue = tokenManager.getRefreshToken();
    if (!refreshTokenValue) {
      console.warn("No refresh token available");
      return false;
    }

    try {
      const response = await AuthService.refreshToken(refreshTokenValue);

      if (response.success) {
        tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
        console.log("Token refreshed automatically");
        return true;
      } else {
        console.error("Token refresh failed:", response.error);
        return false;
      }
    } catch (error) {
      console.error("Auto token refresh failed:", error);

      // Clear tokens and redirect to signin on failure
      tokenManager.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      return false;
    }
  }, []);

  const scheduleSmartRefresh = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const timeLeft = tokenManager.getTokenTimeLeft();
    const expiryDate = tokenManager.getTokenExpiryDate();

    if (timeLeft > 0 && expiryDate) {
      // Schedule refresh 2 minutes before expiry, but not less than 30 seconds
      const refreshTime = Math.max(timeLeft - 2 * 60 * 1000, 30 * 1000);

      console.log(`Smart refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
      console.log(`Token expires at: ${expiryDate.toLocaleTimeString()}`);

      timeoutRef.current = setTimeout(() => {
        refreshToken().then((success) => {
          if (success) {
            // Schedule next refresh after successful refresh
            scheduleSmartRefresh();
          }
        });
      }, refreshTime);
    }
  }, [refreshToken]);

  useEffect(() => {
    if (!tokenManager.isAuthenticated()) {
      console.log("User not authenticated, token refresh disabled");
      return;
    }

    // Check if token is already expiring soon
    if (tokenManager.isTokenExpiringSoon(1)) {
      console.log("Token expiring soon, refreshing immediately...");
      refreshToken().then((success) => {
        if (success) {
          scheduleSmartRefresh();
        }
      });
    } else {
      scheduleSmartRefresh();
    }

    // Set up fallback interval to check every 5 minutes
    intervalRef.current = setInterval(
      () => {
        if (tokenManager.isAuthenticated() && tokenManager.isTokenExpiringSoon(1)) {
          console.log("⚠️ Fallback check: Token expiring soon, refreshing...");
          refreshToken();
        }
      },
      5 * 60 * 1000
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [refreshToken, scheduleSmartRefresh]);

  return {
    refreshToken,
    scheduleSmartRefresh,
    isTokenExpiringSoon: () => tokenManager.isTokenExpiringSoon(),
    getTokenTimeLeft: () => tokenManager.getTokenTimeLeft(),
    getTokenExpiryDate: () => tokenManager.getTokenExpiryDate(),
  };
};
