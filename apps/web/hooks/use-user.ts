/**
 * User Management Hook using TanStack Query
 * =========================================
 *
 * Provides user-related functionality: profile management, user fetching
 * Uses TanStack Query for state management and caching.
 * Uses UserService for all API operations.
 * Requires userId to be passed for most operations since backend expects it.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/axios";
import { UserService, User, UpdateProfileData } from "@/services/user.service";
import { ApiResponse, ApiError } from "@repo/types";
import { tokenManager } from "@/lib/token";
import { useTokenRefresh } from "./use-token-refresh";

export const useUser = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const userId = tokenManager.getUserId();

  // Add automatic token refresh
  const { refreshToken, isTokenExpiringSoon, getTokenTimeLeft, getTokenExpiryDate } = useTokenRefresh();

  // Query: Get current user profile (primary query)
  const currentUser = useQuery<User, Error>({
    queryKey: queryKeys.users.current(),
    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required to fetch current user");
      }
      return UserService.getCurrentUser(userId);
    },
    enabled: !!userId && tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Query: Get all users (only fetched when explicitly needed)
  const allUsers = useQuery<User[], Error>({
    queryKey: queryKeys.users.lists(),
    queryFn: UserService.getAllUsers,
    enabled: false, // Disabled by default - only fetch when explicitly needed
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation: Update user profile
  const updateProfile = useMutation<ApiResponse<User, ApiError>, Error, { userId: string; data: UpdateProfileData }>({
    mutationFn: ({ userId: targetUserId, data }) => UserService.updateProfile(targetUserId, data),
    onSuccess: (_, variables) => {
      // Only invalidate specific user data to prevent cascading
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() });
      // Only invalidate users list if it was actually fetched
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });

  // Mutation: Delete user account
  const deleteAccount = useMutation<ApiResponse<{ message: string }, ApiError>, Error, string>({
    mutationFn: (targetUserId) => UserService.deleteAccount(targetUserId),
    onSuccess: () => {
      // Clear all data and redirect to sign in
      tokenManager.clearTokens();
      queryClient.clear();
      router.push("/signin");
    },
  });

  return {
    // Queries
    currentUser,
    allUsers,

    // Mutations
    updateProfile,
    deleteAccount,

    // Loading states
    isLoading: currentUser.isLoading,
    isLoadingAllUsers: allUsers.isLoading,
    isUpdatingProfile: updateProfile.isPending,
    isDeletingAccount: deleteAccount.isPending,

    // Error states
    error: currentUser.error,
    allUsersError: allUsers.error,
    updateProfileError: updateProfile.error,
    deleteAccountError: deleteAccount.error,

    // Success states
    isUpdateProfileSuccess: updateProfile.isSuccess,
    isDeleteAccountSuccess: deleteAccount.isSuccess,

    // Utility functions
    refetchCurrentUser: currentUser.refetch,
    refetchAllUsers: allUsers.refetch,

    // Reset functions
    resetUpdateProfile: updateProfile.reset,
    resetDeleteAccount: deleteAccount.reset,
  };
};
