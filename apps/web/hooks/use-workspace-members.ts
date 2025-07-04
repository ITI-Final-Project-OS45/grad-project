/**
 * Workspace Members Hook using TanStack Query
 * ===========================================
 *
 * Provides workspace member functionality: update, delete, and fetch members
 * Uses TanStack Query for state management and caching.
 * Uses WorkspaceMemberService for all API operations.
 *
 * Note: addMember functionality is intentionally excluded as requested
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/axios";
import {
  WorkspaceMemberService,
  WorkspaceMember,
  UpdateMemberData,
  DeleteMemberData,
} from "@/services/workspace-member.service";
import { ApiResponse, ApiError } from "@repo/types";
import { toast } from "sonner";

export const useWorkspaceMembers = () => {
  const queryClient = useQueryClient();

  // Update Member Mutation
  const updateMember = useMutation<
    ApiResponse<WorkspaceMember, ApiError>,
    Error,
    { workspaceId: string; data: UpdateMemberData }
  >({
    mutationFn: ({ workspaceId, data }) => WorkspaceMemberService.updateMember(workspaceId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Update the members list in cache optimistically
        queryClient.setQueryData(
          queryKeys.workspaceMembers.byWorkspace(variables.workspaceId),
          (oldData: WorkspaceMember[] | undefined) => {
            if (oldData) {
              return oldData.map((member) => (member.userId === response.data.userId ? response.data : member));
            }
            return oldData;
          }
        );

        // Invalidate workspace members to ensure consistency
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaceMembers.byWorkspace(variables.workspaceId),
          refetchType: "active",
        });

        // Also invalidate workspace details as member roles might affect permissions
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaces.detail(variables.workspaceId),
          refetchType: "active",
        });

        // Show success toast
        toast.success("Member role updated successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to update member role");
    },
  });

  // Delete Member Mutation
  const deleteMember = useMutation<ApiResponse<null, ApiError>, Error, { workspaceId: string; data: DeleteMemberData }>(
    {
      mutationFn: ({ workspaceId, data }) => WorkspaceMemberService.deleteMember(workspaceId, data),
      onSuccess: (response, variables) => {
        if (response.success) {
          // Remove the member from cache optimistically
          queryClient.setQueryData(
            queryKeys.workspaceMembers.byWorkspace(variables.workspaceId),
            (oldData: WorkspaceMember[] | undefined) => {
              if (oldData) {
                // Note: We can't filter by userId directly since we only have membernameOrEmail
                // So we'll invalidate instead for accuracy
                return oldData;
              }
              return oldData;
            }
          );

          // Invalidate workspace members to refetch accurate data
          queryClient.invalidateQueries({
            queryKey: queryKeys.workspaceMembers.byWorkspace(variables.workspaceId),
            refetchType: "active",
          });

          // Also invalidate workspace details as member count might change
          queryClient.invalidateQueries({
            queryKey: queryKeys.workspaces.detail(variables.workspaceId),
            refetchType: "active",
          });

          // Invalidate workspaces list to update member counts
          queryClient.invalidateQueries({
            queryKey: queryKeys.workspaces.lists(),
            refetchType: "active",
          });

          toast.success("Member removed from workspace successfully");
        }
      },
      onError: (error: unknown) => {
        const errorResponse = error as Error;
        toast.error(errorResponse.message || "Failed to remove member");
      },
    }
  );

  return {
    // Mutations
    updateMember,
    deleteMember,

    // Loading states
    isUpdating: updateMember.isPending,
    isDeleting: deleteMember.isPending,

    // Overall loading state
    isLoading: updateMember.isPending || deleteMember.isPending,

    // Error states
    updateError: updateMember.error,
    deleteError: deleteMember.error,

    // Success states
    isUpdateSuccess: updateMember.isSuccess,
    isDeleteSuccess: deleteMember.isSuccess,

    // Reset functions for clearing error/success states
    resetUpdate: updateMember.reset,
    resetDelete: deleteMember.reset,
  };
};

// Hook for fetching all workspace members
export const useWorkspaceMembersByWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: queryKeys.workspaceMembers.byWorkspace(workspaceId),
    queryFn: async () => {
      const response = await WorkspaceMemberService.getAllMembers(workspaceId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch workspace members");
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};

// Hook for fetching a specific workspace member
export const useWorkspaceMember = (workspaceId: string, memberId: string) => {
  return useQuery({
    queryKey: queryKeys.workspaceMembers.detail(workspaceId, memberId),
    queryFn: async () => {
      const response = await WorkspaceMemberService.getMember(workspaceId, memberId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch workspace member");
    },
    enabled: !!workspaceId && !!memberId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
