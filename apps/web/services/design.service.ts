import { apiClient } from "@/lib/axios";
import { ApiError, ApiResponse, DesignResponse } from "@repo/types";

export type Design = DesignResponse;

export interface CreateDesignData {
  workspaceId: string;
  type: string; // e.g., "Figma", "Mockup"
  description?: string;
  assetUrl?: string;
}

export class DesignService {

  private static readonly ENDPOINTS = {
    DESIGNS: (id: string) => `design-assets/workspaces/${id}`,
    DESIGN_BY_ID: ( id: string) => `design-assets/${id}`,

  } as const;

  /**
   * Get all designs for current workspace
   * Maps to GET /design-assets/workspaces/:id'
   */
  static async getAllDesigns(workspaceId: string): Promise<ApiResponse<Design[], ApiError>> {
    const allDesings = await apiClient.get<Design[]>(DesignService.ENDPOINTS.DESIGNS(workspaceId));
    console.log("from the service desings: ❓", allDesings);
    
    return allDesings;
  }

  /**
  * Get a design by id
  * Maps to GET //design-assets/:id
  */
  static async getDesignById(id: string): Promise<ApiResponse<Design, ApiError>> {
    const design = await apiClient.get<Design>(DesignService.ENDPOINTS.DESIGN_BY_ID(id))
    return design
  }

  /**
  * Create a design
  * Maps to POST /design-assets
  */
  static async createDesign(data: CreateDesignData): Promise<ApiResponse<Design, ApiError>> { //! was taken  Partial<Design>
  // static async createDesign(): Promise<ApiResponse<Design, ApiError>> { //! was taken  Partial<Design>
    const design = await apiClient.post<Design>("design-assets", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    // const design = await apiClient.post<Design>("design-assets", {workspaceId: '6852ad075f27723b46b7cbdb', type: 'mockup', description: "description fo the des."});
    return design;
  }

  /**
  * Update a design by id
  * Maps to PATCH /design-assets/:id
  */
  static async updateDesign(id: string, data: Partial<Design>): Promise<ApiResponse<Design, ApiError>> {
    const design = await apiClient.patch<Design>(DesignService.ENDPOINTS.DESIGN_BY_ID(id), data);
    return design;
  }

  /**
  * Delete a design by id
  * Maps to DELETE /design-assets/:id
  */
  static async deleteDesign(id: string): Promise<ApiResponse<null, ApiError>> {
    const response = await apiClient.delete<null>(DesignService.ENDPOINTS.DESIGN_BY_ID(id));
    return response;
  }

}