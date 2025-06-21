import { queryKeys } from "@/lib/axios";
import { DesignService } from "@/services/design.service";
import { useQuery } from "@tanstack/react-query";

export const useDesigns = (workspaceId:string) => {
    return useQuery({
    queryKey: queryKeys.designs.lists(),
    queryFn: async () => {
        const response = await DesignService.getAllDesigns(workspaceId);
        if (response.success) {
        return response.data;
        }
        throw new Error(response.message || "Failed to fetch designs");
    },
    staleTime: 2 * 60 * 1000, // Reduced from 5 minutes to 2 minutes
    gcTime: 10 * 60 * 1000,
    });
};