/**
 * Authentication Hook using TanStack Query
 * =======================================
 *
 * Provides core authentication functionality: signIn, signOut, signUp
 * Uses TanStack Query for state management and caching.
 * Uses AuthService for all API operations.
 * Integrates with enhanced tokenManager for access/refresh token handling.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/axios";
import { SignInFormData, SignUpFormData } from "@/lib/schemas/auth-schemas";
import { AuthService } from "@/services/auth.service";
import { ApiResponse, ApiError, SignUpResponse, LoginResponse } from "@repo/types";
import { tokenManager } from "@/lib/token";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Sign In Mutation
  const signIn = useMutation<ApiResponse<LoginResponse, ApiError>, Error, SignInFormData>({
    mutationFn: AuthService.signIn,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Store both access and refresh tokens in cookies
        tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);

        // Invalidate auth queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: queryKeys.auth });

        // Redirect to workspaces
        router.push("/workspaces");
      }
    },
    onError: (error) => {
      console.error("Sign in error:", error);
      // Clear any existing invalid tokens
      tokenManager.clearTokens();
    },
  });

  // Sign Up Mutation
  const signUp = useMutation<ApiResponse<SignUpResponse, ApiError>, Error, SignUpFormData>({
    mutationFn: AuthService.signUp,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // After successful signup, redirect to sign in
        router.push("/signin");
      }
    },
    onError: (error) => {
      console.error("Sign up error:", error);
    },
  });

  // Sign Out Function
  const signOut = useMutation<void, Error, void>({
    mutationFn: AuthService.signOut,
    onSettled: () => {
      // Clear tokens and cached data regardless of server response
      tokenManager.clearTokens();

      // Clear all cached data
      queryClient.clear();

      // Redirect to sign in page
      router.push("/signin");
    },
  });

  return {
    // Mutations
    signIn,
    signUp,
    signOut,

    // Loading states
    isSigningIn: signIn.isPending,
    isSigningUp: signUp.isPending,
    isSigningOut: signOut.isPending,

    // Overall loading state
    isLoading: signIn.isPending || signUp.isPending || signOut.isPending,

    // Error states
    signInError: signIn.error,
    signUpError: signUp.error,
    signOutError: signOut.error,

    // Success states
    isSignInSuccess: signIn.isSuccess,
    isSignUpSuccess: signUp.isSuccess,
    isSignOutSuccess: signOut.isSuccess,

    // Utility functions
    isAuthenticated: tokenManager.isAuthenticated,

    // Reset functions for clearing error/success states
    resetSignIn: signIn.reset,
    resetSignUp: signUp.reset,
  };
};
