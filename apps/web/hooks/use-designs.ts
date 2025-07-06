import { queryKeys } from "@/lib/axios";
import { Design, DesignService } from "@/services/design.service";
import { ApiResponse, UpdateDesignAssetDto, ApiError } from "@repo/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export function useDesign (workspaceId: string) {

  const queryClient = useQueryClient();

  // Create Workspace Mutation
  const createDesign =  useMutation({
      mutationFn: DesignService.createDesign,
      onSuccess: (response) => {
        
        if (response.success && response.data) {
          // Add the new design to the individual design cache
          // Store just the design data, not the full API response
          console.log("Design created successfully:", response.data);
          
          queryClient.setQueryData(queryKeys.designs.detail(response.data._id), response.data);

          // Update the designs list optimistically
          queryClient.setQueryData(queryKeys.designs.byWorkspace(workspaceId), (oldData: Design[] | undefined) => {
            if (oldData) {
              return [...oldData, response.data];
            }
            return [response.data];
          });

          // Invalidate and refetch designs list to ensure consistency
          queryClient.invalidateQueries({
            queryKey: queryKeys.designs.lists(),
            refetchType: "active",
          });

          // Show success toast
          toast.success("Design created successfully");
        }
      },
      onError: (error: unknown) => {
        const errorResponse = error as Error;
        toast.error(errorResponse.message || "Failed to create design");
      }
    });

  // Update Design Mutation
  const updateDesign = useMutation<ApiResponse<Design, ApiError>, Error, { designId: string; data: UpdateDesignAssetDto }>({
    mutationFn: ({ designId, data }) => DesignService.updateDesign(designId, data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update the design in the individual design cache
        queryClient.setQueryData(queryKeys.designs.detail(response.data._id), response.data);

        // Update the designs list optimistically
        queryClient.setQueryData(queryKeys.designs.lists(), (oldData: Design[] | undefined) => {
          if (oldData) {
            return oldData.map((design) => (design._id === response.data._id ? response.data : design));
          }
          return [response.data];
        });

        // Show success toast
        toast.success("Design updated successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to update design");
    }
  });

  // Delete Design Mutation
  // Delete Design Mutation
  const deleteDesign = useMutation<ApiResponse<null, ApiError>, Error, string>({
    mutationFn: (designId) => DesignService.deleteDesign(designId),
    onSuccess: (response, designId) => {
      if (response.success) {
        // Remove the design from the individual design cache
        queryClient.setQueryData(queryKeys.designs.detail(designId), null);

        // Remove the design from the designs list optimistically - use the correct query key
        queryClient.setQueryData(queryKeys.designs.byWorkspace(workspaceId), (oldData: Design[] | undefined) => {
          if (oldData) {
            return oldData.filter((design) => design._id !== designId);
          }
          return [];
        });

        // Invalidate and refetch designs list to ensure consistency
        queryClient.invalidateQueries({
          queryKey: queryKeys.designs.byWorkspace(workspaceId),
          refetchType: "active",
        });

        // Show success toast
        toast.success("Design deleted successfully");
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as Error;
      toast.error(errorResponse.message || "Failed to delete design");
    },
  });

  return {
    createDesign,
    updateDesign,
    deleteDesign,

    // Loading states
    isCreating: createDesign.isPending,
    isUpdating: updateDesign.isPending,
    isDeleting: deleteDesign.isPending,

    // Overall loading state
    isLoading: createDesign.isPending || updateDesign.isPending || deleteDesign.isPending,

    // Error states
    createError: createDesign.error,
    updateError: updateDesign.error,
    deleteError: deleteDesign.error,

    // Success states
    isCreateSuccess: createDesign.isSuccess,
    isUpdateSuccess: updateDesign.isSuccess,
    isDeleteSuccess: deleteDesign.isSuccess,

    // Reset functions for clearing error/success states
    resetCreate: createDesign.reset,
    resetUpdate: updateDesign.reset,
    resetDelete: deleteDesign.reset,
    workspaceId, // expose workspaceId if needed
  }

}

export const useDesigns = (workspaceId:string) => {
    const query = useQuery({
        queryKey: queryKeys.designs.byWorkspace(workspaceId),
        queryFn: async () => {
            const response = await DesignService.getAllDesigns(workspaceId)
            if(response.success){
                console.log('from query function: 🔴', response.data);
                return response.data;              
            }
            throw new Error(response.message || "failed to get desings");
        },
        staleTime:  3 * 1000 * 60, //ms === 3 min.
        gcTime:     10 * 1000 *60
    })
    return query;
};

export const useDesignById = (designId: string) => {
  return useQuery({
    queryKey: queryKeys.designs.detail(designId),
    queryFn: async () => {
      const response = await DesignService.getDesignById(designId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || "failed to get design");
    },
  });
};