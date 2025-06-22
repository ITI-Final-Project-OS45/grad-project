/**
 * Release Hook using TanStack Query
 * =================================
 *
 * Provides release functionality: create, read, update, delete, deploy releases
 * Uses TanStack Query for state management and caching.
 * Uses ReleaseService for all API operations.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/axios";
import {
  ReleaseService,
  ReleaseResponse,
  CreateReleaseData,
  UpdateReleaseData,
  DeployReleaseData,
} from "@/services/release.service";
import { ApiResponse, ApiError, QAStatus } from "@repo/types";
import { toast } from "sonner";

export const useRelease = () => {
  const queryClient = useQueryClient();

  // Create Release Mutation
  const createRelease = useMutation<ApiResponse<ReleaseResponse, ApiError>, Error, CreateReleaseData>({
    mutationFn: ReleaseService.createRelease,
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.releases.detail(response.data._id), response.data);

        queryClient.setQueryData(
          queryKeys.releases.byWorkspace(variables.workspaceId),
          (oldData: ReleaseResponse[] | undefined) => {
            if (oldData) {
              return [...oldData, response.data];
            }
            return [response.data];
          }
        );

        queryClient.invalidateQueries({
          queryKey: queryKeys.releases.byWorkspace(variables.workspaceId),
          refetchType: "active",
        });

        toast.success("Release created successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to create release");
    },
  });

  // Update Release Mutation
  const updateRelease = useMutation<
    ApiResponse<ReleaseResponse, ApiError>,
    Error,
    { releaseId: string; data: UpdateReleaseData; workspaceId?: string }
  >({
    mutationFn: ({ releaseId, data }) => ReleaseService.updateRelease(releaseId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.releases.detail(variables.releaseId), response.data);

        if (variables.workspaceId) {
          queryClient.setQueryData(
            queryKeys.releases.byWorkspace(variables.workspaceId),
            (oldData: ReleaseResponse[] | undefined) => {
              if (oldData) {
                return oldData.map((release) => (release._id === variables.releaseId ? response.data : release));
              }
              return oldData;
            }
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.releases.byWorkspace(variables.workspaceId),
            refetchType: "active",
          });
        }

        toast.success("Release updated successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to update release");
    },
  });

  // Deploy Release Mutation
  const deployRelease = useMutation<
    ApiResponse<ReleaseResponse, ApiError>,
    Error,
    { releaseId: string; data?: DeployReleaseData; workspaceId?: string }
  >({
    mutationFn: ({ releaseId, data }) => ReleaseService.deployRelease(releaseId, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.releases.detail(variables.releaseId), response.data);

        if (variables.workspaceId) {
          queryClient.setQueryData(
            queryKeys.releases.byWorkspace(variables.workspaceId),
            (oldData: ReleaseResponse[] | undefined) => {
              if (oldData) {
                return oldData.map((release) => (release._id === variables.releaseId ? response.data : release));
              }
              return oldData;
            }
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.releases.byWorkspace(variables.workspaceId),
            refetchType: "active",
          });
        }

        toast.success("Release deployed successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to deploy release");
    },
  });

  // Update QA Status Mutation
  const updateQAStatus = useMutation<
    ApiResponse<ReleaseResponse, ApiError>,
    Error,
    { releaseId: string; qaStatus: QAStatus; workspaceId?: string }
  >({
    mutationFn: ({ releaseId, qaStatus }) => ReleaseService.updateQAStatus(releaseId, qaStatus),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.releases.detail(variables.releaseId), response.data);

        if (variables.workspaceId) {
          queryClient.setQueryData(
            queryKeys.releases.byWorkspace(variables.workspaceId),
            (oldData: ReleaseResponse[] | undefined) => {
              if (oldData) {
                return oldData.map((release) => (release._id === variables.releaseId ? response.data : release));
              }
              return oldData;
            }
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.releases.byWorkspace(variables.workspaceId),
            refetchType: "active",
          });
        }

        toast.success("QA status updated successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to update QA status");
    },
  });

  // Delete Release Mutation
  const deleteRelease = useMutation<ApiResponse<null, ApiError>, Error, { releaseId: string; workspaceId?: string }>({
    mutationFn: ({ releaseId }) => ReleaseService.deleteRelease(releaseId),
    onSuccess: (response, variables) => {
      if (response.success) {
        if (variables.workspaceId) {
          queryClient.setQueryData(
            queryKeys.releases.byWorkspace(variables.workspaceId),
            (oldData: ReleaseResponse[] | undefined) => {
              if (oldData) {
                return oldData.filter((release) => release._id !== variables.releaseId);
              }
              return oldData;
            }
          );

          queryClient.invalidateQueries({
            queryKey: queryKeys.releases.byWorkspace(variables.workspaceId),
            refetchType: "active",
          });
        }

        queryClient.removeQueries({ queryKey: queryKeys.releases.detail(variables.releaseId) });

        toast.success("Release deleted successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to delete release");
    },
  });

  return {
    // Mutations
    createRelease,
    updateRelease,
    deployRelease,
    updateQAStatus,
    deleteRelease,

    // Loading states
    isCreating: createRelease.isPending,
    isUpdating: updateRelease.isPending,
    isDeploying: deployRelease.isPending,
    isUpdatingQA: updateQAStatus.isPending,
    isDeleting: deleteRelease.isPending,

    // Overall loading state
    isLoading:
      createRelease.isPending ||
      updateRelease.isPending ||
      deployRelease.isPending ||
      updateQAStatus.isPending ||
      deleteRelease.isPending,

    // Error states
    createError: createRelease.error,
    updateError: updateRelease.error,
    deployError: deployRelease.error,
    qaError: updateQAStatus.error,
    deleteError: deleteRelease.error,

    // Success states
    isCreateSuccess: createRelease.isSuccess,
    isUpdateSuccess: updateRelease.isSuccess,
    isDeploySuccess: deployRelease.isSuccess,
    isQAUpdateSuccess: updateQAStatus.isSuccess,
    isDeleteSuccess: deleteRelease.isSuccess,

    // Reset functions for clearing error/success states
    resetCreate: createRelease.reset,
    resetUpdate: updateRelease.reset,
    resetDeploy: deployRelease.reset,
    resetQA: updateQAStatus.reset,
    resetDelete: deleteRelease.reset,
  };
};

// Hook for fetching all releases by workspace
export const useReleases = (workspaceId: string) => {
  return useQuery({
    queryKey: queryKeys.releases.byWorkspace(workspaceId),
    queryFn: async () => {
      const response = await ReleaseService.getReleasesByWorkspace(workspaceId);
      if (response.success) {
        // Always return array, even if empty
        return response.data || [];
      }
      throw new Error(response.message || "Failed to fetch releases");
    },
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
    // Add default data to prevent undefined state
    placeholderData: [],
  });
};

export const useReleaseById = (releaseId: string) => {
  return useQuery({
    queryKey: queryKeys.releases.detail(releaseId),
    queryFn: async () => {
      const response = await ReleaseService.getReleaseById(releaseId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "Failed to fetch release");
    },
    enabled: !!releaseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};
