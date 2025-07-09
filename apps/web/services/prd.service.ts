/**
 * PRD Service
 * ===========
 *
 * Handles all PRD-related API operations including:
 * - Create PRD
 * - Get PRDs by workspace
 * - Update PRD
 * - Delete PRD
 *
 * This service maps frontend data to the exact API format
 * expected by the NestJS backend and transforms responses back
 * to frontend-compatible formats.
 *
 * API Endpoints:
 * - POST /workspaces/:workspaceId/prd    - Create PRD
 * - GET /workspaces/:workspaceId/prd     - Get PRDs by workspace
 * - PUT /workspaces/:workspaceId/prd     - Update PRD
 * - DELETE /workspaces/:workspaceId/prd  - Delete PRD
 *
 * @author Mohamed Hesham
 */

import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiError, CreatePrdDto, UpdatePrdDto } from "@repo/types";

// PRD type - we'll use the Prd schema type from backend
export interface Prd {
  _id: string;
  workspaceId: string;
  title: string;
  content: string;
  createdBy: {
    _id: string;
    username: string;
    displayName: string;
    email: string;
  };
  versions: {
    versionNo: number;
    title: string;
    content: string;
    createdBy: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

// Create PRD data type for frontend
export interface CreatePrdData {
  title: string;
  content: string;
}

// Update PRD data type for frontend
export interface UpdatePrdData {
  title?: string;
  content?: string;
}

export class PrdService {
  private static readonly ENDPOINTS = {
    CREATE_PRD: (workspaceId: string) => `/prd/workspace/${workspaceId}`,
    GET_PRDS_BY_WORKSPACE: (workspaceId: string) => `/prd/workspace/${workspaceId}`,
    UPDATE_PRD: (prdId: string) => `/prd/${prdId}`,
    DELETE_PRD: (prdId: string) => `/prd/${prdId}`,
  } as const;

  /**
   * Create new PRD
   * Maps to POST /api/v1/prd/workspace/:workspaceId
   */
  static async createPrd(workspaceId: string, data: CreatePrdData): Promise<ApiResponse<Prd, ApiError>> {
    // Map to CreatePrdDto format expected by backend
    const prdData: CreatePrdDto = {
      title: data.title,
      content: data.content,
    };

    return await apiClient.post<Prd>(PrdService.ENDPOINTS.CREATE_PRD(workspaceId), prdData);
  }

  /**
   * Get PRDs by workspace
   * Maps to GET /api/v1/prd/workspace/:workspaceId
   */
  static async getPrdsByWorkspace(workspaceId: string): Promise<ApiResponse<Prd[], ApiError>> {
    return await apiClient.get<Prd[]>(PrdService.ENDPOINTS.GET_PRDS_BY_WORKSPACE(workspaceId));
  }

  /**
   * Update PRD by ID
   * Maps to PUT /api/v1/prd/:prdId
   */
  static async updatePrd(prdId: string, data: UpdatePrdData): Promise<ApiResponse<Prd, ApiError>> {
    // Map to UpdatePrdDto format expected by backend
    const updateData: UpdatePrdDto = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.content !== undefined) {
      updateData.content = data.content;
    }

    return await apiClient.put<Prd>(PrdService.ENDPOINTS.UPDATE_PRD(prdId), updateData);
  }

  /**
   * Delete PRD by ID
   * Maps to DELETE /api/v1/prd/:prdId
   */
  static async deletePrd(prdId: string): Promise<ApiResponse<null, ApiError>> {
    return await apiClient.delete<null>(PrdService.ENDPOINTS.DELETE_PRD(prdId));
  }
}
