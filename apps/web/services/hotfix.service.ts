/**
 * Hotfix Service
 * ==============
 *
 * Handles all hotfix-related API operations including:
 * - Create hotfix for a release
 * - Get hotfix by ID
 * - Get all hotfixes for a release
 * - Get all hotfixes
 * - Update hotfix
 * - Delete hotfix
 *
 *
 * API Endpoints:
 * - POST /hotfixes/release/:releaseId   - Create hotfix for release
 * - GET /hotfixes/:id                   - Get hotfix by ID
 * - GET /hotfixes/release/:releaseId    - Get all hotfixes for release
 * - GET /hotfixes                       - Get all hotfixes
 * - PATCH /hotfixes/:id                 - Update hotfix
 * - DELETE /hotfixes/:id                - Delete hotfix
 *
 * @author Mohamed Hesham
 */

import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiError, CreateHotfixDto, UpdateHotfixDto, HotfixStatus, HotfixResponse } from "@repo/types";

export type Hotfix = HotfixResponse;

// Create hotfix data type for frontend
export interface CreateHotfixData {
  title: string;
  description: string;
  attachedCommits?: string[];
  deploymentNotes?: string;
}

// Update hotfix data type for frontend
export interface UpdateHotfixData {
  title?: string;
  description?: string;
  status?: HotfixStatus;
  attachedCommits?: string[];
  deploymentNotes?: string;
  fixedDate?: string;
}

export class HotfixService {
  private static readonly ENDPOINTS = {
    HOTFIXES: "/hotfixes",
    HOTFIX_BY_ID: (id: string) => `/hotfixes/${id}`,
    HOTFIXES_BY_RELEASE: (releaseId: string) => `/hotfixes/release/${releaseId}`,
    CREATE_HOTFIX_FOR_RELEASE: (releaseId: string) => `/hotfixes/release/${releaseId}`,
  } as const;

  /**
   * Create new hotfix for a release
   * Maps to POST /hotfixes/release/:releaseId
   */
  static async createHotfix(releaseId: string, data: CreateHotfixData): Promise<ApiResponse<Hotfix, ApiError>> {
    // Map to CreateHotfixDto format expected by backend
    const hotfixData: CreateHotfixDto = {
      title: data.title,
      description: data.description,
      attachedCommits: data.attachedCommits || [],
      deploymentNotes: data.deploymentNotes,
    };

    return await apiClient.post<Hotfix>(HotfixService.ENDPOINTS.CREATE_HOTFIX_FOR_RELEASE(releaseId), hotfixData);
  }

  /**
   * Get hotfix by ID
   * Maps to GET /hotfixes/:id
   */
  static async getHotfixById(hotfixId: string): Promise<ApiResponse<Hotfix, ApiError>> {
    return await apiClient.get<Hotfix>(HotfixService.ENDPOINTS.HOTFIX_BY_ID(hotfixId));
  }

  /**
   * Get all hotfixes for a release
   * Maps to GET /hotfixes/release/:releaseId
   */
  static async getHotfixesByRelease(releaseId: string): Promise<ApiResponse<Hotfix[], ApiError>> {
    return await apiClient.get<Hotfix[]>(HotfixService.ENDPOINTS.HOTFIXES_BY_RELEASE(releaseId));
  }

  /**
   * Get all hotfixes
   * Maps to GET /hotfixes
   */
  static async getAllHotfixes(): Promise<ApiResponse<Hotfix[], ApiError>> {
    return await apiClient.get<Hotfix[]>(HotfixService.ENDPOINTS.HOTFIXES);
  }

  /**
   * Update hotfix
   * Maps to PATCH /hotfixes/:id
   */
  static async updateHotfix(hotfixId: string, data: UpdateHotfixData): Promise<ApiResponse<Hotfix, ApiError>> {
    // Map to partial UpdateHotfixDto format expected by backend
    const updateData: Partial<UpdateHotfixDto> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.attachedCommits !== undefined) {
      updateData.attachedCommits = data.attachedCommits;
    }
    if (data.deploymentNotes !== undefined) {
      updateData.deploymentNotes = data.deploymentNotes;
    }
    if (data.fixedDate !== undefined) {
      updateData.fixedDate = data.fixedDate;
    }

    return await apiClient.patch<Hotfix>(HotfixService.ENDPOINTS.HOTFIX_BY_ID(hotfixId), updateData);
  }

  /**
   * Delete hotfix
   * Maps to DELETE /hotfixes/:id
   */
  static async deleteHotfix(hotfixId: string): Promise<ApiResponse<null, ApiError>> {
    return await apiClient.delete<null>(HotfixService.ENDPOINTS.HOTFIX_BY_ID(hotfixId));
  }
}
