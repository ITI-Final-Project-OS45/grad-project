/**
 * Authentication Hook using TanStack Query
 * =======================================
 *
 * Provides core authentication functionality: signIn, signOut, signUp
 * Uses TanStack Query for state management and caching.
 * Uses AuthService for all API operations.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { tokenManager, queryKeys } from "@/lib/axios";
import { SignInFormData, SignUpFormData } from "@/lib/schemas/auth-schemas";
import { AuthService, SignInResponse, SignUpResponse } from "@/services/auth.service";
import { ApiResponse, ApiError } from "@repo/types";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Sign In Mutation
  const signIn = useMutation<ApiResponse<SignInResponse, ApiError>, Error, SignInFormData>({
    mutationFn: AuthService.signIn,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Store token in cookies
        tokenManager.setToken(response.data.token);

        // Cache user data
        queryClient.setQueryData(queryKeys.currentUser(), response.data.user);

        // Invalidate auth queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: queryKeys.auth() });

        // Redirect to dashboard
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      console.error("Sign in error:", error);
      // Clear any existing invalid tokens
      tokenManager.clearToken();
    },
  });

  // Sign Up Mutation
  const signUp = useMutation<ApiResponse<SignUpResponse, ApiError>, Error, SignUpFormData>({
    mutationFn: AuthService.signUp,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Store token in cookies
        tokenManager.setToken(response.data.token);

        // Cache user data
        queryClient.setQueryData(queryKeys.currentUser(), response.data.user);

        // Invalidate auth queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: queryKeys.auth() });

        // Redirect to dashboard
        router.push("/dashboard");
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
      // Clear token and cached data regardless of server response
      tokenManager.clearToken();

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
