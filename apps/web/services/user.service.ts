/**
 * User Management Service
 * ======================
 *
 * Handles RUD operations: Read, Update, Delete user data
 */

import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiError } from "@repo/types";

// TODO: Replace with actual types from packages/
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// TODO: Replace with actual types from packages/
export interface UpdateProfileData {
  name?: string;
  email?: string;
  username?: string;
}
// TODO: Replace with actual types from packages/
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class UserService {
  /**
   * READ: Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>("/users");
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch user data");
  }

  /**
   * READ: Get user by ID
   */
  static async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || "Failed to fetch user data");
  }

  /**
   * UPDATE: Update user profile
   */
  static async updateProfile(updateData: UpdateProfileData): Promise<ApiResponse<User, ApiError>> {
    return await apiClient.put<User>("/users", updateData);
  }

  /**
   * UPDATE: Change user password
   */
  static async changePassword(passwordData: ChangePasswordData): Promise<ApiResponse<{ message: string }, ApiError>> {
    return await apiClient.patch("/users/password", passwordData);
  }

  /**
   * DELETE: Delete user account
   */
  static async deleteAccount(password: string): Promise<ApiResponse<{ message: string }, ApiError>> {
    return await apiClient.delete("/users", {
      data: { password },
    });
  }
}
