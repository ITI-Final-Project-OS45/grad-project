/**
 * Invitation Service
 * ==================
 *
 * Handles all invitation-related API operations including:
 * - Create invite for workspace
 * - Respond to invite (accept/decline)
 * - Get invites for user
 * - Get invites for workspace
 * - Delete invite
 *
 * API Endpoints:
 * - POST /invites/:workspaceId     - Create invite
 * - PATCH /invites/respond/:inviteId - Respond to invite
 * - GET /invites/user              - Get invites for user
 * - GET /invites/workspace/:workspaceId - Get invites for workspace
 * - DELETE /invites/:inviteId      - Delete invite
 *
 * @author Mohamed Hesham
 */

import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiError, UserRole, InviteStatus } from "@repo/types";

// Invite response type based on backend schema with populated data
export interface Invite {
  _id: string;
  userId: {
    _id: string;
    username: string;
    displayName: string;
    email: string;
  };
  status: InviteStatus;
  workspaceId: {
    _id: string;
    name: string;
    description?: string;
  };
  role: UserRole;
  invitedBy: {
    _id: string;
    username: string;
    displayName: string;
    email: string;
  };
  sentAt: Date;
  acceptedAt?: Date;
}

// Create invite data type
export interface CreateInviteData {
  usernameOrEmail: string;
  role: UserRole;
}

// Respond to invite data type
export interface RespondToInviteData {
  action: "accept" | "decline";
}

export class InviteService {
  private static readonly ENDPOINTS = {
    CREATE_INVITE: (workspaceId: string) => `/invites/${workspaceId}`,
    RESPOND_TO_INVITE: (inviteId: string) => `/invites/respond/${inviteId}`,
    GET_USER_INVITES: () => `/invites/user`,
    GET_WORKSPACE_INVITES: (workspaceId: string) => `/invites/workspace/${workspaceId}`,
    DELETE_INVITE: (inviteId: string) => `/invites/${inviteId}`,
  } as const;

  /**
   * Create new invite for workspace
   * Maps to POST /invites/:workspaceId
   */
  static async createInvite(workspaceId: string, data: CreateInviteData): Promise<ApiResponse<Invite, ApiError>> {
    return await apiClient.post<Invite>(InviteService.ENDPOINTS.CREATE_INVITE(workspaceId), data);
  }

  /**
   * Respond to invite (accept or decline)
   * Maps to PATCH /invites/respond/:inviteId
   */
  static async respondToInvite(inviteId: string, data: RespondToInviteData): Promise<ApiResponse<Invite, ApiError>> {
    return await apiClient.patch<Invite>(InviteService.ENDPOINTS.RESPOND_TO_INVITE(inviteId), data);
  }

  /**
   * Get all invites for current user
   * Maps to GET /invites/user
   */
  static async getUserInvites(): Promise<ApiResponse<Invite[], ApiError>> {
    return await apiClient.get<Invite[]>(InviteService.ENDPOINTS.GET_USER_INVITES());
  }

  /**
   * Get all invites for a workspace (manager only)
   * Maps to GET /invites/workspace/:workspaceId
   */
  static async getWorkspaceInvites(workspaceId: string): Promise<ApiResponse<Invite[], ApiError>> {
    return await apiClient.get<Invite[]>(InviteService.ENDPOINTS.GET_WORKSPACE_INVITES(workspaceId));
  }

  /**
   * Delete an invite (manager only)
   * Maps to DELETE /invites/:inviteId
   */
  static async deleteInvite(inviteId: string): Promise<ApiResponse<null, ApiError>> {
    return await apiClient.delete<null>(InviteService.ENDPOINTS.DELETE_INVITE(inviteId));
  }
}
