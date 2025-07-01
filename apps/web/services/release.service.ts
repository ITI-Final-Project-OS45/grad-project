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
import { ApiResponse, ApiError, CreateReleaseDto, UpdateReleaseDto, ReleaseResponse, QAStatus } from "@repo/types";

export type Release = ReleaseResponse;

// Create release data type for frontend
export interface CreateReleaseData {
  versionTag: string;
  workspaceId: string;
  description: string;
  plannedDate: string;
}

// Update release data type for frontend
export interface UpdateReleaseData {
  versionTag?: string;
  description?: string;
  plannedDate?: string;
}

// Deploy release data type
export type DeployReleaseData = Record<string, never>;

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
  static async createRelease(data: CreateReleaseData): Promise<ApiResponse<Release, ApiError>> {
    // Map to CreateReleaseDto format
    const releaseData: CreateReleaseDto = {
      versionTag: data.versionTag,
      workspaceId: data.workspaceId,
      description: data.description,
      plannedDate: data.plannedDate,
    };

    return await apiClient.post<Release>(ReleaseService.ENDPOINTS.RELEASES, releaseData);
  }

  /**
   * Get release by ID
   * Maps to GET /releases/:id
   */
  static async getReleaseById(releaseId: string): Promise<ApiResponse<Release, ApiError>> {
    return await apiClient.get<Release>(ReleaseService.ENDPOINTS.RELEASE_BY_ID(releaseId));
  }

  /**
   * Get all releases for workspace
   * Maps to GET /releases/workspace/:workspaceId
   */
  static async getReleasesByWorkspace(workspaceId: string): Promise<ApiResponse<Release[], ApiError>> {
    return await apiClient.get<Release[]>(ReleaseService.ENDPOINTS.RELEASES_BY_WORKSPACE(workspaceId));
  }

  /**
   * Update release
   * Maps to PUT /releases/:id
   */
  static async updateRelease(releaseId: string, data: UpdateReleaseData): Promise<ApiResponse<Release, ApiError>> {
    // Map to UpdateReleaseDto format
    const updateData: UpdateReleaseDto = {};

    if (data.versionTag !== undefined) {
      updateData.versionTag = data.versionTag;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.plannedDate !== undefined) {
      updateData.plannedDate = data.plannedDate;
    }

    return await apiClient.put<Release>(ReleaseService.ENDPOINTS.RELEASE_BY_ID(releaseId), updateData);
  }

  /**
   * Deploy release
   * Maps to PUT /releases/:id/deploy
   * Note: API doesn't accept any body data, just triggers deploy
   */
  static async deployRelease(releaseId: string): Promise<ApiResponse<Release, ApiError>> {
    // API ignores body data, only uses userId from JWT token
    return await apiClient.put<Release>(ReleaseService.ENDPOINTS.DEPLOY_RELEASE(releaseId));
  }

  /**
   * Update QA status
   * Maps to PUT /releases/:id/qa
   */
  static async updateQAStatus(releaseId: string, qaStatus: QAStatus): Promise<ApiResponse<Release, ApiError>> {
    return await apiClient.put<Release>(ReleaseService.ENDPOINTS.UPDATE_QA_STATUS(releaseId), { qaStatus });
  }

  /**
   * Delete release
   * Maps to DELETE /releases/:id
   */
  static async deleteRelease(releaseId: string): Promise<ApiResponse<null, ApiError>> {
    return await apiClient.delete<null>(ReleaseService.ENDPOINTS.RELEASE_BY_ID(releaseId));
  }
}
