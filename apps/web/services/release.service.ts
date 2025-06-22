/**
 * Release Service
 * ===============
 *
 * Handles all release-related API operations including:
 * - Create release
 * - Get release by ID
 * - Get all releases for workspace
 * - Update release
 * - Delete release
 * - Deploy release
 * - Update QA status
 *
 * This service maps frontend data to the exact API format
 * expected by the NestJS backend and transforms responses back
 * to frontend-compatible formats.
 *
 * API Endpoints:
 * - POST /releases                     - Create release
 * - GET /releases/:id                  - Get release by ID
 * - GET /releases/workspace/:id        - Get all releases for workspace
 * - PUT /releases/:id                  - Update release
 * - DELETE /releases/:id               - Delete release
 * - PUT /releases/:id/deploy           - Deploy release
 * - PUT /releases/:id/qa               - Update QA status
 *
 * @author Mohamed Hesham
 */

import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiError, CreateReleaseDto, QAStatus } from "@repo/types";

// Frontend release type
export type ReleaseResponse = {
  _id: string;
  versionTag: string;
  workspaceId: string;
  description: string;
  plannedDate: string;
  associatedTasks?: string[];
  bugs?: string[];
  hotfixes?: string[];
  qaStatus: QAStatus;
  deployedBy?: string;
  deployedDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

// Create release data type
export interface CreateReleaseData {
  versionTag: string;
  workspaceId: string;
  description: string;
  plannedDate: string;
  associatedTasks?: string[];
}

// Update release data type
export interface UpdateReleaseData {
  versionTag?: string;
  description?: string;
  plannedDate?: string;
  associatedTasks?: string[];
}

// Deploy release data type
export interface DeployReleaseData {
  deploymentNotes?: string;
}

export class ReleaseService {
  private static readonly ENDPOINTS = {
    RELEASES: "/releases",
    RELEASE_BY_ID: (id: string) => `/releases/${id}`,
    RELEASES_BY_WORKSPACE: (workspaceId: string) => `/releases/workspace/${workspaceId}`,
    DEPLOY_RELEASE: (id: string) => `/releases/${id}/deploy`,
    UPDATE_QA_STATUS: (id: string) => `/releases/${id}/qa`,
  } as const;

  /**
   * Create new release
   * Maps to POST /releases
   */
  static async createRelease(data: CreateReleaseData): Promise<ApiResponse<ReleaseResponse, ApiError>> {
    // Map to CreateReleaseDto format expected by backend
    const releaseData: CreateReleaseDto = {
      versionTag: data.versionTag,
      workspaceId: data.workspaceId,
      description: data.description,
      plannedDate: data.plannedDate,
      associatedTasks: data.associatedTasks,
    };

    return await apiClient.post<ReleaseResponse>(ReleaseService.ENDPOINTS.RELEASES, releaseData);
  }

  /**
   * Get release by ID
   * Maps to GET /releases/:id
   */
  static async getReleaseById(releaseId: string): Promise<ApiResponse<ReleaseResponse, ApiError>> {
    return await apiClient.get<ReleaseResponse>(ReleaseService.ENDPOINTS.RELEASE_BY_ID(releaseId));
  }

  /**
   * Get all releases for workspace
   * Maps to GET /releases/workspace/:workspaceId
   */
  static async getReleasesByWorkspace(workspaceId: string): Promise<ApiResponse<ReleaseResponse[], ApiError>> {
    return await apiClient.get<ReleaseResponse[]>(ReleaseService.ENDPOINTS.RELEASES_BY_WORKSPACE(workspaceId));
  }

  /**
   * Update release
   * Maps to PUT /releases/:id
   */
  static async updateRelease(
    releaseId: string,
    data: UpdateReleaseData
  ): Promise<ApiResponse<ReleaseResponse, ApiError>> {
    // Map to partial CreateReleaseDto format expected by backend
    const updateData: Partial<CreateReleaseDto> = {};

    if (data.versionTag !== undefined) {
      updateData.versionTag = data.versionTag;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.plannedDate !== undefined) {
      updateData.plannedDate = data.plannedDate;
    }
    if (data.associatedTasks !== undefined) {
      updateData.associatedTasks = data.associatedTasks;
    }

    return await apiClient.put<ReleaseResponse>(ReleaseService.ENDPOINTS.RELEASE_BY_ID(releaseId), updateData);
  }

  /**
   * Deploy release
   * Maps to PUT /releases/:id/deploy
   */
  static async deployRelease(
    releaseId: string,
    data?: DeployReleaseData
  ): Promise<ApiResponse<ReleaseResponse, ApiError>> {
    return await apiClient.put<ReleaseResponse>(ReleaseService.ENDPOINTS.DEPLOY_RELEASE(releaseId), data || {});
  }

  /**
   * Update QA status
   * Maps to PUT /releases/:id/qa
   */
  static async updateQAStatus(releaseId: string, qaStatus: QAStatus): Promise<ApiResponse<ReleaseResponse, ApiError>> {
    return await apiClient.put<ReleaseResponse>(ReleaseService.ENDPOINTS.UPDATE_QA_STATUS(releaseId), { qaStatus });
  }

  /**
   * Delete release
   * Maps to DELETE /releases/:id
   */
  static async deleteRelease(releaseId: string): Promise<ApiResponse<null, ApiError>> {
    return await apiClient.delete<null>(ReleaseService.ENDPOINTS.RELEASE_BY_ID(releaseId));
  }
}
