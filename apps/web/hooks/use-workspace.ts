/**
 * Workspace Hook using TanStack Query
 * ===================================
 *
 * Provides workspace functionality: create, read, update, delete workspaces
 * Uses TanStack Query for state management and caching.
 * Uses WorkspaceService for all API operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { queryKeys } from "@/lib/axios";
import { WorkspaceService, Workspace, CreateWorkspaceData, UpdateWorkspaceData } from "@/services/workspace.service";
import { ApiResponse, ApiError } from "@repo/types";
import { toast } from "sonner";

 
export const useWorkspace = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Create Workspace Mutation
  const createWorkspace = useMutation<ApiResponse<Workspace, ApiError>, Error, CreateWorkspaceData>({
    mutationFn: WorkspaceService.createWorkspace,
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Add the new workspace to the individual workspace cache
        // Store just the workspace data, not the full API response
        queryClient.setQueryData(queryKeys.workspaces.detail(response.data._id), response.data);

        // Update the workspaces list optimistically
        queryClient.setQueryData(queryKeys.workspaces.lists(), (oldData: Workspace[] | undefined) => {
          if (oldData) {
            return [...oldData, response.data];
          }
          return [response.data];
        });

        // Invalidate and refetch workspaces list to ensure consistency
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaces.lists(),
          refetchType: "active",
        });

        // Show success toast
        toast.success("Workspace created successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to create workspace");
    },
  });

  // Update Workspace Mutation
  const updateWorkspace = useMutation<
    ApiResponse<Workspace, ApiError>,
    Error,
    { workspaceId: string; data: UpdateWorkspaceData }
  >({
    mutationFn: ({ workspaceId, data }) => WorkspaceService.updateWorkspace(workspaceId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Update the specific workspace in cache with just the workspace data
        queryClient.setQueryData(queryKeys.workspaces.detail(variables.workspaceId), response.data);

        // Update the workspace in the list cache optimistically
        queryClient.setQueryData(queryKeys.workspaces.lists(), (oldData: Workspace[] | undefined) => {
          if (oldData) {
            return oldData.map((workspace) => (workspace._id === variables.workspaceId ? response.data : workspace));
          }
          return oldData;
        });

        // Invalidate workspaces list to ensure consistency
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaces.lists(),
          refetchType: "active",
        });

        // Show success toast
        toast.success("Workspace updated successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to update workspace");
    },
  });

  // Delete Workspace Mutation
  const deleteWorkspace = useMutation<ApiResponse<null, ApiError>, Error, string>({
    mutationFn: WorkspaceService.deleteWorkspace,
    onSuccess: (response, workspaceId) => {
      if (response.success) {
        // Remove the workspace from the list cache optimistically
        queryClient.setQueryData(queryKeys.workspaces.lists(), (oldData: Workspace[] | undefined) => {
          if (oldData) {
            return oldData.filter((workspace) => workspace._id !== workspaceId);
          }
          return oldData;
        });

        queryClient.removeQueries({ queryKey: queryKeys.workspaces.detail(workspaceId) });

        // Invalidate workspaces list to ensure consistency
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaces.lists(),
          refetchType: "active",
        });

        toast.success("Workspace deleted successfully");
        router.push("/workspaces");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to delete workspace");
    },
  });

  return {
    // Mutations
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,

    // Loading states
    isCreating: createWorkspace.isPending,
    isUpdating: updateWorkspace.isPending,
    isDeleting: deleteWorkspace.isPending,

    // Overall loading state
    isLoading: createWorkspace.isPending || updateWorkspace.isPending || deleteWorkspace.isPending,

    // Error states
    createError: createWorkspace.error,
    updateError: updateWorkspace.error,
    deleteError: deleteWorkspace.error,

    // Success states
    isCreateSuccess: createWorkspace.isSuccess,
    isUpdateSuccess: updateWorkspace.isSuccess,
    isDeleteSuccess: deleteWorkspace.isSuccess,

    // Reset functions for clearing error/success states
    resetCreate: createWorkspace.reset,
    resetUpdate: updateWorkspace.reset,
    resetDelete: deleteWorkspace.reset,
  };
};

// Hook for fetching all workspaces
export const useWorkspaces = () => {
  return useQuery({
    queryKey: queryKeys.workspaces.lists(),
    queryFn: async () => {
      const response = await WorkspaceService.getAllWorkspaces();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch workspaces");
    },
    staleTime: 2 * 60 * 1000, // Reduced from 5 minutes to 2 minutes
    gcTime: 10 * 60 * 1000,
  });
};

export const useWorkspaceById = (workspaceId: string) => {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(workspaceId),
    queryFn: async () => {
      const response = await WorkspaceService.getWorkspaceById(workspaceId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch workspace");
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // Reduced from 5 minutes to 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2, // Add retry logic
  });
};
