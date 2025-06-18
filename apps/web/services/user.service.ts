/**
 * User Management Service
 * ======================
 *
 * Handles all user-related API operations including:
 * - Fetching current user profile
 * - Fetching all users
 * - Fetching user by ID
 * - Updating user profile
 * - Deleting user account
 *
 * API Endpoints:
 * - GET /users           - Get all users
 * - GET /users/:id       - Get user by ID
 * - PATCH /users/:id     - Update user
 * - DELETE /users/:id    - Delete user
 *
 * @author Mohamed Hesham
 */

import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiError, UserResponse, UserDto } from "@repo/types";

export type UpdateProfileData = Partial<UserDto>

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type User = UserResponse;

export class UserService {
  private static readonly ENDPOINTS = {
    USERS: "/users",
    USER_BY_ID: (id: string) => `/users/${id}`,
  } as const;

  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string): Promise<User> {
    const response = await apiClient.get<User>(UserService.ENDPOINTS.USER_BY_ID(userId));
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch user profile");
  }

  /**
   * Get all users
   * Maps to GET /users
   */
  static async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>(UserService.ENDPOINTS.USERS);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch users");
  }

  /**
   * Get user by ID
   * Maps to GET /users/:id
   */
  static async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(UserService.ENDPOINTS.USER_BY_ID(userId));
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch user data");
  }

  /**
   * Update user profile
   * Maps to PATCH /users/:id
   */
  static async updateProfile(userId: string, data: UpdateProfileData): Promise<ApiResponse<User, ApiError>> {
    return await apiClient.patch<User>(UserService.ENDPOINTS.USER_BY_ID(userId), data);
  }

  /**
   * Delete user account
   * Maps to DELETE /users/:id
   */
  static async deleteAccount(userId: string): Promise<ApiResponse<{ message: string }, ApiError>> {
    const response = await apiClient.delete<null>(UserService.ENDPOINTS.USER_BY_ID(userId));

    if (response.success) {
      return {
        ...response,
        data: { message: "Account deleted successfully" },
      };
    }

    return response as ApiResponse<{ message: string }, ApiError>;
  }
}
