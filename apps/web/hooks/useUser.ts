/**
 * User Management Hook using TanStack Query
 * ========================================
 *
 * Provides RUD operations: Read, Update, Delete user data
 * Uses TanStack Query for state management, caching, and optimistic updates.
 * Uses UserService for all API operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { tokenManager, queryKeys } from "@/lib/axios";
import { UserService, User, UpdateProfileData, ChangePasswordData } from "@/services/user.service";
import { ApiResponse, ApiError } from "@repo/types";

// Context types for mutations
interface ProfileMutationContext {
  previousUser?: User;
}

export const useUser = (userId?: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // READ: Get current user query
  const currentUser = useQuery<User, Error>({
    queryKey: queryKeys.currentUser(),
    queryFn: UserService.getCurrentUser,
    enabled: tokenManager.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // READ: Get specific user query (for viewing other users)
  const user = useQuery<User, Error>({
    queryKey: queryKeys.user(userId!),
    queryFn: () => UserService.getUserById(userId!),
    enabled: !!userId && userId !== currentUser.data?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes for other users
  });

  // UPDATE: Update profile mutation
  const updateProfile = useMutation<ApiResponse<User, ApiError>, Error, UpdateProfileData, ProfileMutationContext>({
    mutationFn: UserService.updateProfile,
    onMutate: async (updateData): Promise<ProfileMutationContext> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.currentUser() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(queryKeys.currentUser());

      // Optimistically update
      if (previousUser) {
        const optimisticData: User = {
          ...previousUser,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<User>(queryKeys.currentUser(), optimisticData);
      }

      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.currentUser(), context.previousUser);
      }
      console.error("Profile update error:", error);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update cached data with server response
        queryClient.setQueryData(queryKeys.currentUser(), response.data);
      }
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.currentUser() });
    },
  });

  // UPDATE: Change password mutation
  const changePassword = useMutation<ApiResponse<{ message: string }, ApiError>, Error, ChangePasswordData>({
    mutationFn: UserService.changePassword,
    onError: (error) => {
      console.error("Password change error:", error);
    },
  });

  // DELETE: Delete account mutation
  const deleteAccount = useMutation<ApiResponse<{ message: string }, ApiError>, Error, { password: string }>({
    mutationFn: async ({ password }) => UserService.deleteAccount(password),
    onSuccess: () => {
      // Clear all data and redirect
      tokenManager.clearToken();
      queryClient.clear();
      router.push("/");
    },
    onError: (error) => {
      console.error("Account deletion error:", error);
    },
  });

  return {
    // READ: Queries
    currentUser,
    user: userId ? user : undefined,

    // UPDATE & DELETE: Mutations
    updateProfile,
    changePassword,
    deleteAccount,

    // Loading states
    isLoading: currentUser.isLoading || (userId ? user.isLoading : false),
    isUpdatingProfile: updateProfile.isPending,
    isChangingPassword: changePassword.isPending,
    isDeletingAccount: deleteAccount.isPending,

    // Error states
    error: currentUser.error || (userId ? user.error : null),
    updateProfileError: updateProfile.error,
    changePasswordError: changePassword.error,
    deleteAccountError: deleteAccount.error,

    // Success states
    isUpdateProfileSuccess: updateProfile.isSuccess,
    isChangePasswordSuccess: changePassword.isSuccess,
    isDeleteAccountSuccess: deleteAccount.isSuccess,

    // Utility functions
    refetchUser: currentUser.refetch,

    // Reset functions
    resetUpdateProfile: updateProfile.reset,
    resetChangePassword: changePassword.reset,
    resetDeleteAccount: deleteAccount.reset,
  };
};
