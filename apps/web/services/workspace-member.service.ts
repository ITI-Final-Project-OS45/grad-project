/**
 * Workspace Members Service
 * =========================
 *
 * Handles workspace member-related API operations including:
 * - Update member role
 * - Delete member from workspace
 * - Get all workspace members
 * - Get specific member by workspace
 *
 * Note: addMember functionality is intentionally excluded as requested
 *
 * API Endpoints:
 * - PATCH /workspace-member/:id    - Update member role
 * - DELETE /workspace-member/:id   - Delete member
 * - GET /workspace-member/:id      - Get all workspace members
 * - GET /workspace-member/:workspaceId/member/:memberId - Get specific member
 *
 * @author Mohamed Hesham
 */

import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiError, UserRole } from "@repo/types";

// Workspace member type based on backend schema with populated user data
export interface WorkspaceMember {
  userId: {
    _id: string;
    username: string;
    displayName: string;
    email: string;
  };
  role: UserRole;
  joinedAt: Date;
}

// Update member data type
export interface UpdateMemberData {
  membernameOrEmail: string;
  role: UserRole;
}

// Delete member data type
export interface DeleteMemberData {
  membernameOrEmail: string;
}

export class WorkspaceMemberService {
  private static readonly ENDPOINTS = {
    UPDATE_MEMBER: (workspaceId: string) => `/workspace-member/${workspaceId}`,
    DELETE_MEMBER: (workspaceId: string) => `/workspace-member/${workspaceId}`,
    GET_ALL_MEMBERS: (workspaceId: string) => `/workspace-member/${workspaceId}`,
    GET_MEMBER: (workspaceId: string, memberId: string) => `/workspace-member/${workspaceId}/member/${memberId}`,
  } as const;

  /**
   * Update member role in workspace
   * Maps to PATCH /workspace-member/:id
   */
  static async updateMember(
    workspaceId: string,
    data: UpdateMemberData
  ): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    return await apiClient.patch<WorkspaceMember>(WorkspaceMemberService.ENDPOINTS.UPDATE_MEMBER(workspaceId), data);
  }

  /**
   * Delete member from workspace
   * Maps to DELETE /workspace-member/:id
   */
  static async deleteMember(workspaceId: string, data: DeleteMemberData): Promise<ApiResponse<null, ApiError>> {
    return await apiClient.delete<null>(WorkspaceMemberService.ENDPOINTS.DELETE_MEMBER(workspaceId), { data });
  }

  /**
   * Get all members of a workspace
   * Maps to GET /workspace-member/:id
   */
  static async getAllMembers(workspaceId: string): Promise<ApiResponse<WorkspaceMember[], ApiError>> {
    return await apiClient.get<WorkspaceMember[]>(WorkspaceMemberService.ENDPOINTS.GET_ALL_MEMBERS(workspaceId));
  }

  /**
   * Get specific member by workspace and member ID
   * Maps to GET /workspace-member/:workspaceId/member/:memberId
   */
  static async getMember(workspaceId: string, memberId: string): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    return await apiClient.get<WorkspaceMember>(WorkspaceMemberService.ENDPOINTS.GET_MEMBER(workspaceId, memberId));
  }
}
