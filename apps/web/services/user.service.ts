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

export interface UpdateProfileData extends Partial<UserDto> {}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export type User = UserResponse;

export class UserService {
  /**
   * Get current user profile
   * Note: This gets the current user based on the auth token
   * You might need to implement a /users/me endpoint on the backend
   * For now, we'll need to get the userId from the token and call /users/:id
   */
  static async getCurrentUser(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
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
    const response = await apiClient.get<User[]>("/users");
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
    const response = await apiClient.get<User>(`/users/${userId}`);
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
    return await apiClient.patch<User>(`/users/${userId}`, data);
  }

  /**
   * Delete user account
   * Maps to DELETE /users/:id
   */
  static async deleteAccount(userId: string): Promise<ApiResponse<{ message: string }, ApiError>> {
    const response = await apiClient.delete<null>(`/users/${userId}`);

    // Transform the response to include a message
    if (response.success) {
      return {
        ...response,
        data: { message: "Account deleted successfully" },
      };
    }

    return response as ApiResponse<{ message: string }, ApiError>;
  }
}
