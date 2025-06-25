import { apiClient } from "@/lib/axios";
import { ApiError, ApiResponse, DesignResponse } from "@repo/types";

export type Design = DesignResponse;


export class DesignService {
    private static readonly ENDPOINTS = {
    DESIGNS: (id: string) => `design-assets/workspaces/${id}`,
    // DESIGN_BY_ID: (workspaceId: string, id: string) => `/workspaces/${workspaceId}/designs/${id}`,
  } as const;

    /**
     * Get all workspaces for current user
     * Maps to GET /workspaces
     */
    static async getAllDesigns(workspaceId: string): Promise<ApiResponse<Design[], ApiError>> {
      const allDesings = await apiClient.get<Design[]>(DesignService.ENDPOINTS.DESIGNS(workspaceId));
      console.log('---------------------------------------------------------------------------------------');
      console.log(allDesings);
      console.log('---------------------------------------------------------------------------------------');
      
      return allDesings;
    }

}