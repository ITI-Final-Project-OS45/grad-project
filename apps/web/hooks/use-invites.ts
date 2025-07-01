/**
 * Invite Hook using TanStack Query
 * ================================
 *
 * Provides invitation functionality: create, respond, fetch, and delete invites
 * Uses TanStack Query for state management and caching.
 * Uses InviteService for all API operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/axios";
import { InviteService, Invite, CreateInviteData, RespondToInviteData } from "@/services/invite.service";
import { ApiResponse, ApiError } from "@repo/types";
import { toast } from "sonner";

export const useInvites = () => {
  const queryClient = useQueryClient();

  // Create Invite Mutation
  const createInvite = useMutation<
    ApiResponse<Invite, ApiError>,
    Error,
    { workspaceId: string; data: CreateInviteData }
  >({
    mutationFn: ({ workspaceId, data }) => InviteService.createInvite(workspaceId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Invalidate workspace invites to refetch the list
        queryClient.invalidateQueries({
          queryKey: queryKeys.invites.workspaceInvites(variables.workspaceId),
          refetchType: "active",
        });

        // Show success toast
        toast.success("Invitation sent successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to send invitation");
    },
  });

  // Respond to Invite Mutation
  const respondToInvite = useMutation<
    ApiResponse<Invite, ApiError>,
    Error,
    { inviteId: string; data: RespondToInviteData }
  >({
    mutationFn: ({ inviteId, data }) => InviteService.respondToInvite(inviteId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Update the specific invite in cache
        queryClient.setQueryData(queryKeys.invites.detail(variables.inviteId), response.data);

        // Invalidate user invites to refetch the list
        queryClient.invalidateQueries({
          queryKey: queryKeys.invites.userInvites(),
          refetchType: "active",
        });

        // If accepted, invalidate workspaces to show new workspace
        if (variables.data.action === "accept") {
          queryClient.invalidateQueries({
            queryKey: queryKeys.workspaces.lists(),
            refetchType: "active",
          });
        }

        // Show success toast
        const action = variables.data.action === "accept" ? "accepted" : "declined";
        toast.success(`Invitation ${action} successfully`);
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to respond to invitation");
    },
  });

  // Delete Invite Mutation
  const deleteInvite = useMutation<ApiResponse<null, ApiError>, Error, { inviteId: string; workspaceId: string }>({
    mutationFn: ({ inviteId }) => InviteService.deleteInvite(inviteId),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Remove the invite from workspace invites cache
        queryClient.setQueryData(
          queryKeys.invites.workspaceInvites(variables.workspaceId),
          (oldData: Invite[] | undefined) => {
            if (oldData) {
              return oldData.filter((invite) => invite._id !== variables.inviteId);
            }
            return oldData;
          }
        );

        // Remove from detail cache
        queryClient.removeQueries({
          queryKey: queryKeys.invites.detail(variables.inviteId),
        });

        toast.success("Invitation deleted successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to delete invitation");
    },
  });

  return {
    // Mutations
    createInvite,
    respondToInvite,
    deleteInvite,

    // Loading states
    isCreating: createInvite.isPending,
    isResponding: respondToInvite.isPending,
    isDeleting: deleteInvite.isPending,

    // Overall loading state
    isLoading: createInvite.isPending || respondToInvite.isPending || deleteInvite.isPending,

    // Error states
    createError: createInvite.error,
    respondError: respondToInvite.error,
    deleteError: deleteInvite.error,

    // Success states
    isCreateSuccess: createInvite.isSuccess,
    isRespondSuccess: respondToInvite.isSuccess,
    isDeleteSuccess: deleteInvite.isSuccess,

    // Reset functions for clearing error/success states
    resetCreate: createInvite.reset,
    resetRespond: respondToInvite.reset,
    resetDelete: deleteInvite.reset,
  };
};

// Hook for fetching user invites
export const useUserInvites = () => {
  return useQuery({
    queryKey: queryKeys.invites.userInvites(),
    queryFn: async () => {
      const response = await InviteService.getUserInvites();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch user invites");
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for fetching workspace invites (manager only)
export const useWorkspaceInvites = (workspaceId: string) => {
  return useQuery({
    queryKey: queryKeys.invites.workspaceInvites(workspaceId),
    queryFn: async () => {
      const response = await InviteService.getWorkspaceInvites(workspaceId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch workspace invites");
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
