/**
 * PRD Hook using TanStack Query
 * =============================
 *
 * Provides PRD functionality: create, read, update, delete PRDs
 * Uses TanStack Query for state management and caching.
 * Uses PrdService for all API operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PrdService, CreatePrdData, UpdatePrdData, Prd } from "@/services/prd.service";
import { ApiResponse, ApiError } from "@repo/types";
import { queryKeys } from "@/lib/axios";
import { toast } from "sonner";

export const usePrd = () => {
  const queryClient = useQueryClient();

  // Create PRD Mutation
  const createPrd = useMutation<ApiResponse<Prd, ApiError>, Error, { workspaceId: string; data: CreatePrdData }>({
    mutationFn: ({ workspaceId, data }) => PrdService.createPrd(workspaceId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Update the PRDs list in cache
        queryClient.setQueryData(queryKeys.prds.byWorkspace(variables.workspaceId), (oldData: Prd[] | undefined) => {
          if (oldData) {
            return [...oldData, response.data];
          }
          return [response.data];
        });

        queryClient.invalidateQueries({
          queryKey: queryKeys.prds.byWorkspace(variables.workspaceId),
          refetchType: "active",
        });

        queryClient.invalidateQueries({
          queryKey: queryKeys.prds.lists(),
          refetchType: "active",
        });

        toast.success("PRD created successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to create PRD");
    },
  });

  // Update PRD Mutation
  const updatePrd = useMutation<ApiResponse<Prd, ApiError>, Error, { prdId: string; data: UpdatePrdData }>({
    mutationFn: ({ prdId, data }) => PrdService.updatePrd(prdId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Update the PRDs list in cache
        queryClient.setQueryData(
          queryKeys.prds.byWorkspace(response.data.workspaceId),
          (oldData: Prd[] | undefined) => {
            if (oldData) {
              return oldData.map((prd) => (prd._id === response.data._id ? response.data : prd));
            }
            return [response.data];
          }
        );

        queryClient.invalidateQueries({
          queryKey: queryKeys.prds.byWorkspace(response.data.workspaceId),
          refetchType: "active",
        });

        queryClient.invalidateQueries({
          queryKey: queryKeys.prds.lists(),
          refetchType: "active",
        });

        toast.success("PRD updated successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to update PRD");
    },
  });

  // Delete PRD Mutation
  const deletePrd = useMutation<ApiResponse<null, ApiError>, Error, { prdId: string; workspaceId?: string }>({
    mutationFn: ({ prdId }) => PrdService.deletePrd(prdId),
    onSuccess: (response, variables) => {
      if (response.success) {
        // If we have workspaceId, update the specific workspace cache
        if (variables.workspaceId) {
          queryClient.setQueryData(queryKeys.prds.byWorkspace(variables.workspaceId), []);

          queryClient.invalidateQueries({
            queryKey: queryKeys.prds.byWorkspace(variables.workspaceId),
            refetchType: "active",
          });
        }

        // Also invalidate general lists
        queryClient.invalidateQueries({
          queryKey: queryKeys.prds.lists(),
          refetchType: "active",
        });

        toast.success("PRD deleted successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to delete PRD");
    },
  });

  return {
    // Mutations
    createPrd,
    updatePrd,
    deletePrd,

    // Loading states
    isCreating: createPrd.isPending,
    isUpdating: updatePrd.isPending,
    isDeleting: deletePrd.isPending,

    // Overall loading state
    isLoading: createPrd.isPending || updatePrd.isPending || deletePrd.isPending,

    // Error states
    createError: createPrd.error,
    updateError: updatePrd.error,
    deleteError: deletePrd.error,

    // Success states
    isCreateSuccess: createPrd.isSuccess,
    isUpdateSuccess: updatePrd.isSuccess,
    isDeleteSuccess: deletePrd.isSuccess,

    // Reset functions for clearing error/success states
    resetCreate: createPrd.reset,
    resetUpdate: updatePrd.reset,
    resetDelete: deletePrd.reset,
  };
};

// Hook for fetching PRDs by workspace
export const usePrdsByWorkspace = (workspaceId: string) => {
  return useQuery({
    queryKey: queryKeys.prds.byWorkspace(workspaceId),
    queryFn: async () => {
      const response = await PrdService.getPrdsByWorkspace(workspaceId);
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || "Failed to fetch PRDs");
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    placeholderData: [],
  });
};
