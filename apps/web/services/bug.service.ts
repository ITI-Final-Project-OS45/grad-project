/**
 * Bug Service
 * ===========
 *
 * Handles all bug-related API operations including:
 * - Create bug
 * - Get bug by ID
 * - Get all bugs for a release
 * - Get all bugs
 * - Update bug
 * - Delete bug
 *
 * This service maps frontend data to the exact API format
 * expected by the NestJS backend and transforms responses back
 * to frontend-compatible formats.
 *
 * API Endpoints:
 * - POST /bugs                      - Create bug
 * - GET /bugs/:id                   - Get bug by ID
 * - GET /bugs/release/:releaseId    - Get all bugs for release
 * - GET /bugs                       - Get all bugs
 * - PATCH /bugs/:id                 - Update bug
 * - DELETE /bugs/:id                - Delete bug
 *
 * @author Mohamed Hesham
 */

import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiError, CreateBugDto, UpdateBugDto, BugResponse, BugSeverity, BugStatus } from "@repo/types";

export type Bug = BugResponse;

// Create bug data type for frontend
export interface CreateBugData {
  title: string;
  description: string;
  severity: BugSeverity;
  releaseId: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  assignedTo?: string;
}

// Update bug data type for frontend
export interface UpdateBugData {
  title?: string;
  description?: string;
  severity?: BugSeverity;
  status?: BugStatus;
  assignedTo?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
}

export class BugService {
  private static readonly ENDPOINTS = {
    BUGS: "/bugs",
    BUG_BY_ID: (id: string) => `/bugs/${id}`,
    BUGS_BY_RELEASE: (releaseId: string) => `/bugs/release/${releaseId}`,
  } as const;

  /**
   * Create new bug
   * Maps to POST /bugs
   */
  static async createBug(data: CreateBugData): Promise<ApiResponse<Bug, ApiError>> {
    // Map to CreateBugDto format expected by backend
    const bugData: CreateBugDto = {
      title: data.title,
      description: data.description,
      severity: data.severity,
      releaseId: data.releaseId,
      stepsToReproduce: data.stepsToReproduce,
      expectedBehavior: data.expectedBehavior,
      actualBehavior: data.actualBehavior,
      assignedTo: data.assignedTo,
    };

    return await apiClient.post<Bug>(BugService.ENDPOINTS.BUGS, bugData);
  }

  /**
   * Get bug by ID
   * Maps to GET /bugs/:id
   */
  static async getBugById(bugId: string): Promise<ApiResponse<Bug, ApiError>> {
    return await apiClient.get<Bug>(BugService.ENDPOINTS.BUG_BY_ID(bugId));
  }

  /**
   * Get all bugs for a release
   * Maps to GET /bugs/release/:releaseId
   */
  static async getBugsByRelease(releaseId: string): Promise<ApiResponse<Bug[], ApiError>> {
    return await apiClient.get<Bug[]>(BugService.ENDPOINTS.BUGS_BY_RELEASE(releaseId));
  }

  /**
   * Get all bugs
   * Maps to GET /bugs
   */
  static async getAllBugs(): Promise<ApiResponse<Bug[], ApiError>> {
    return await apiClient.get<Bug[]>(BugService.ENDPOINTS.BUGS);
  }

  /**
   * Update bug
   * Maps to PATCH /bugs/:id
   */
  static async updateBug(bugId: string, data: UpdateBugData): Promise<ApiResponse<Bug, ApiError>> {
    // Map to UpdateBugDto format expected by backend
    const updateData: UpdateBugDto = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.severity !== undefined) {
      updateData.severity = data.severity;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.assignedTo !== undefined) {
      updateData.assignedTo = data.assignedTo;
    }
    if (data.stepsToReproduce !== undefined) {
      updateData.stepsToReproduce = data.stepsToReproduce;
    }
    if (data.expectedBehavior !== undefined) {
      updateData.expectedBehavior = data.expectedBehavior;
    }
    if (data.actualBehavior !== undefined) {
      updateData.actualBehavior = data.actualBehavior;
    }

    return await apiClient.patch<Bug>(BugService.ENDPOINTS.BUG_BY_ID(bugId), updateData);
  }

  /**
   * Delete bug
   * Maps to DELETE /bugs/:id
   */
  static async deleteBug(bugId: string): Promise<ApiResponse<null, ApiError>> {
    return await apiClient.delete<null>(BugService.ENDPOINTS.BUG_BY_ID(bugId));
  }
}
