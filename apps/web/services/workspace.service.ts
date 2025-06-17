import { WorkspaceResponse } from "./../../../packages/types/src/responses/workspace.response";
/**
 * Workspace Service
 * ================
 *
 * Handles all workspace-related API operations including:
 * - Create workspace
 * - Get workspace by ID
 * - Get all workspaces for user
 * - Update workspace
 * - Delete workspace
 *
 * This service maps frontend data to the exact API format
 * expected by the NestJS backend and transforms responses back
 * to frontend-compatible formats.
 *
 * API Endpoints:
 * - POST /workspaces       - Create workspace
 * - GET /workspaces/:id    - Get workspace by ID
 * - GET /workspaces        - Get all workspaces for user
 * - PATCH /workspaces/:id  - Update workspace
 * - DELETE /workspaces/:id - Delete workspace
 *
 * @author Mohamed Hesham
 */

import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiError, WorkspaceDto } from "@repo/types";

export type Workspace = WorkspaceResponse;

// Create workspace data type
export interface CreateWorkspaceData {
  name: string;
  description: string;
}

// Update workspace data type
export interface UpdateWorkspaceData {
  name?: string;
  description?: string;
}

export class WorkspaceService {
  private static readonly ENDPOINTS = {
    WORKSPACES: "/workspaces",
    WORKSPACE_BY_ID: (id: string) => `/workspaces/${id}`,
  } as const;

  /**
   * Create new workspace
   * Maps to POST /workspaces
   */
  static async createWorkspace(data: CreateWorkspaceData): Promise<ApiResponse<Workspace, ApiError>> {
    // Map to WorkspaceDto format expected by backend
    const workspaceData: WorkspaceDto = {
      name: data.name,
      description: data.description,
    };

    return await apiClient.post<Workspace>(WorkspaceService.ENDPOINTS.WORKSPACES, workspaceData);
  }

  /**
   * Get workspace by ID
   * Maps to GET /workspaces/:id
   */
  static async getWorkspaceById(workspaceId: string): Promise<ApiResponse<Workspace, ApiError>> {
    return await apiClient.get<Workspace>(WorkspaceService.ENDPOINTS.WORKSPACE_BY_ID(workspaceId));
  }

  /**
   * Get all workspaces for current user
   * Maps to GET /workspaces
   */
  static async getAllWorkspaces(): Promise<ApiResponse<Workspace[], ApiError>> {
    return await apiClient.get<Workspace[]>(WorkspaceService.ENDPOINTS.WORKSPACES);
  }

  /**
   * Update workspace
   * Maps to PATCH /workspaces/:id
   */
  static async updateWorkspace(
    workspaceId: string,
    data: UpdateWorkspaceData
  ): Promise<ApiResponse<Workspace, ApiError>> {
    // Map to partial WorkspaceDto format expected by backend
    const updateData: Partial<WorkspaceDto> = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    return await apiClient.patch<Workspace>(WorkspaceService.ENDPOINTS.WORKSPACE_BY_ID(workspaceId), updateData);
  }

  /**
   * Delete workspace
   * Maps to DELETE /workspaces/:id
   */
  static async deleteWorkspace(workspaceId: string): Promise<ApiResponse<null, ApiError>> {
    return await apiClient.delete<null>(WorkspaceService.ENDPOINTS.WORKSPACE_BY_ID(workspaceId));
  }
}
