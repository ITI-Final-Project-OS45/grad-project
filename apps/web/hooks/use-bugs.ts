/**
 * Bug Hook using TanStack Query
 * ==============================
 *
 * Provides bug functionality: create, read, update, delete bugs
 * Uses TanStack Query for state management and caching.
 * Uses BugService for all API operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BugService, CreateBugData, UpdateBugData } from "@/services/bug.service";
import { ApiResponse, ApiError, BugResponse } from "@repo/types";
import { queryKeys } from "@/lib/axios";
import { toast } from "sonner";

export const useBug = () => {
  const queryClient = useQueryClient();

  // Create Bug Mutation
  const createBug = useMutation<ApiResponse<BugResponse, ApiError>, Error, CreateBugData>({
    mutationFn: BugService.createBug,
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.bugs.detail(response.data._id), response.data);

        queryClient.setQueryData(
          queryKeys.bugs.byRelease(variables.releaseId),
          (oldData: BugResponse[] | undefined) => {
            if (oldData) {
              return [...oldData, response.data];
            }
            return [response.data];
          }
        );

        queryClient.invalidateQueries({
          queryKey: queryKeys.bugs.byRelease(variables.releaseId),
          refetchType: "active",
        });

        queryClient.invalidateQueries({
          queryKey: queryKeys.bugs.lists(),
          refetchType: "active",
        });

        toast.success("Bug created successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to create bug");
    },
  });

  // Update Bug Mutation
  const updateBug = useMutation<
    ApiResponse<BugResponse, ApiError>,
    Error,
    { bugId: string; data: UpdateBugData; releaseId?: string }
  >({
    mutationFn: ({ bugId, data }) => BugService.updateBug(bugId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.bugs.detail(variables.bugId), response.data);

        if (variables.releaseId) {
          queryClient.setQueryData(
            queryKeys.bugs.byRelease(variables.releaseId),
            (oldData: BugResponse[] | undefined) => {
              if (oldData) {
                return oldData.map((bug) => (bug._id === variables.bugId ? response.data : bug));
              }
              return oldData;
            }
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.bugs.byRelease(variables.releaseId),
            refetchType: "active",
          });
        }

        queryClient.invalidateQueries({
          queryKey: queryKeys.bugs.lists(),
          refetchType: "active",
        });

        toast.success("Bug updated successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to update bug");
    },
  });

  // Delete Bug Mutation
  const deleteBug = useMutation<ApiResponse<null, ApiError>, Error, { bugId: string; releaseId?: string }>({
    mutationFn: ({ bugId }) => BugService.deleteBug(bugId),
    onSuccess: (response, variables) => {
      if (response.success) {
        if (variables.releaseId) {
          queryClient.setQueryData(
            queryKeys.bugs.byRelease(variables.releaseId),
            (oldData: BugResponse[] | undefined) => {
              if (oldData) {
                return oldData.filter((bug) => bug._id !== variables.bugId);
              }
              return oldData;
            }
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.bugs.byRelease(variables.releaseId),
            refetchType: "active",
          });
        }

        queryClient.removeQueries({ queryKey: queryKeys.bugs.detail(variables.bugId) });

        queryClient.invalidateQueries({
          queryKey: queryKeys.bugs.lists(),
          refetchType: "active",
        });

        toast.success("Bug deleted successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to delete bug");
    },
  });

  return {
    // Mutations
    createBug,
    updateBug,
    deleteBug,

    // Loading states
    isCreating: createBug.isPending,
    isUpdating: updateBug.isPending,
    isDeleting: deleteBug.isPending,

    // Overall loading state
    isLoading: createBug.isPending || updateBug.isPending || deleteBug.isPending,

    // Error states
    createError: createBug.error,
    updateError: updateBug.error,
    deleteError: deleteBug.error,

    // Success states
    isCreateSuccess: createBug.isSuccess,
    isUpdateSuccess: updateBug.isSuccess,
    isDeleteSuccess: deleteBug.isSuccess,

    // Reset functions for clearing error/success states
    resetCreate: createBug.reset,
    resetUpdate: updateBug.reset,
    resetDelete: deleteBug.reset,
  };
};

// Hook for fetching all bugs
export const useBugs = () => {
  return useQuery({
    queryKey: queryKeys.bugs.lists(),
    queryFn: async () => {
      const response = await BugService.getAllBugs();
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || "Failed to fetch bugs");
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    placeholderData: [],
  });
};

// Hook for fetching bugs by release
export const useBugsByRelease = (releaseId: string) => {
  return useQuery({
    queryKey: queryKeys.bugs.byRelease(releaseId),
    queryFn: async () => {
      const response = await BugService.getBugsByRelease(releaseId);
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || "Failed to fetch bugs");
    },
    enabled: !!releaseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    placeholderData: [],
  });
};

// Hook for fetching a single bug by ID
export const useBugById = (bugId: string) => {
  return useQuery({
    queryKey: queryKeys.bugs.detail(bugId),
    queryFn: async () => {
      const response = await BugService.getBugById(bugId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch bug");
    },
    enabled: !!bugId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
