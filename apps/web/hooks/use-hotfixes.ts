/**
 * Hotfix Hook using TanStack Query
 * ================================
 *
 * Provides hotfix functionality: create, read, update, delete hotfixes
 * Uses TanStack Query for state management and caching.
 * Uses HotfixService for all API operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HotfixService, CreateHotfixData, UpdateHotfixData } from "@/services/hotfix.service";
import { ApiResponse, ApiError, HotfixResponse } from "@repo/types";
import { queryKeys } from "@/lib/axios";
import { toast } from "sonner";

export const useHotfix = () => {
  const queryClient = useQueryClient();

  // Create Hotfix Mutation
  const createHotfix = useMutation<
    ApiResponse<HotfixResponse, ApiError>,
    Error,
    { releaseId: string; data: CreateHotfixData }
  >({
    mutationFn: ({ releaseId, data }) => HotfixService.createHotfix(releaseId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.hotfixes.detail(response.data._id), response.data);

        queryClient.setQueryData(
          queryKeys.hotfixes.byRelease(variables.releaseId),
          (oldData: HotfixResponse[] | undefined) => {
            if (oldData) {
              return [...oldData, response.data];
            }
            return [response.data];
          }
        );

        queryClient.invalidateQueries({
          queryKey: queryKeys.hotfixes.byRelease(variables.releaseId),
          refetchType: "active",
        });

        queryClient.invalidateQueries({
          queryKey: queryKeys.hotfixes.lists(),
          refetchType: "active",
        });

        toast.success("Hotfix created successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to create hotfix");
    },
  });

  // Update Hotfix Mutation
  const updateHotfix = useMutation<
    ApiResponse<HotfixResponse, ApiError>,
    Error,
    { hotfixId: string; data: UpdateHotfixData; releaseId?: string }
  >({
    mutationFn: ({ hotfixId, data }) => HotfixService.updateHotfix(hotfixId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.hotfixes.detail(variables.hotfixId), response.data);

        if (variables.releaseId) {
          queryClient.setQueryData(
            queryKeys.hotfixes.byRelease(variables.releaseId),
            (oldData: HotfixResponse[] | undefined) => {
              if (oldData) {
                return oldData.map((hotfix) => (hotfix._id === variables.hotfixId ? response.data : hotfix));
              }
              return oldData;
            }
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.hotfixes.byRelease(variables.releaseId),
            refetchType: "active",
          });
        }

        queryClient.invalidateQueries({
          queryKey: queryKeys.hotfixes.lists(),
          refetchType: "active",
        });

        toast.success("Hotfix updated successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to update hotfix");
    },
  });

  // Delete Hotfix Mutation
  const deleteHotfix = useMutation<ApiResponse<null, ApiError>, Error, { hotfixId: string; releaseId?: string }>({
    mutationFn: ({ hotfixId }) => HotfixService.deleteHotfix(hotfixId),
    onSuccess: (response, variables) => {
      if (response.success) {
        if (variables.releaseId) {
          queryClient.setQueryData(
            queryKeys.hotfixes.byRelease(variables.releaseId),
            (oldData: HotfixResponse[] | undefined) => {
              if (oldData) {
                return oldData.filter((hotfix) => hotfix._id !== variables.hotfixId);
              }
              return oldData;
            }
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.hotfixes.byRelease(variables.releaseId),
            refetchType: "active",
          });
        }

        queryClient.removeQueries({ queryKey: queryKeys.hotfixes.detail(variables.hotfixId) });

        queryClient.invalidateQueries({
          queryKey: queryKeys.hotfixes.lists(),
          refetchType: "active",
        });

        toast.success("Hotfix deleted successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to delete hotfix");
    },
  });

  return {
    // Mutations
    createHotfix,
    updateHotfix,
    deleteHotfix,

    // Loading states
    isCreating: createHotfix.isPending,
    isUpdating: updateHotfix.isPending,
    isDeleting: deleteHotfix.isPending,

    // Overall loading state
    isLoading: createHotfix.isPending || updateHotfix.isPending || deleteHotfix.isPending,

    // Error states
    createError: createHotfix.error,
    updateError: updateHotfix.error,
    deleteError: deleteHotfix.error,

    // Success states
    isCreateSuccess: createHotfix.isSuccess,
    isUpdateSuccess: updateHotfix.isSuccess,
    isDeleteSuccess: deleteHotfix.isSuccess,

    // Reset functions for clearing error/success states
    resetCreate: createHotfix.reset,
    resetUpdate: updateHotfix.reset,
    resetDelete: deleteHotfix.reset,
  };
};

// Hook for fetching all hotfixes
export const useHotfixes = () => {
  return useQuery({
    queryKey: queryKeys.hotfixes.lists(),
    queryFn: async () => {
      const response = await HotfixService.getAllHotfixes();
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || "Failed to fetch hotfixes");
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    placeholderData: [],
  });
};

// Hook for fetching hotfixes by release
export const useHotfixesByRelease = (releaseId: string) => {
  return useQuery({
    queryKey: queryKeys.hotfixes.byRelease(releaseId),
    queryFn: async () => {
      const response = await HotfixService.getHotfixesByRelease(releaseId);
      if (response.success) {
        return response.data || [];
      }
      throw new Error(response.message || "Failed to fetch hotfixes");
    },
    enabled: !!releaseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    placeholderData: [],
  });
};

// Hook for fetching a single hotfix by ID
export const useHotfixById = (hotfixId: string) => {
  return useQuery({
    queryKey: queryKeys.hotfixes.detail(hotfixId),
    queryFn: async () => {
      const response = await HotfixService.getHotfixById(hotfixId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch hotfix");
    },
    enabled: !!hotfixId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
