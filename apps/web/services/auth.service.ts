/**
 * Authentication Service
 * ====================
 *
 * Handles core authentication operations: signIn, signOut, signUp
 */

import { apiClient } from "@/lib/axios";
import { SignInFormData, SignUpFormData } from "@/lib/schemas/auth-schemas";
import { ApiResponse, ApiError } from "@repo/types";

// TODO: Replace with actual types from packages/
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  expiresIn: number;
}

// Use type aliases instead of empty interfaces extending AuthResponse
export type SignInResponse = AuthResponse;
export type SignUpResponse = AuthResponse;

export class AuthService {
  /**
   * Sign in user with credentials
   */
  static async signIn(credentials: SignInFormData): Promise<ApiResponse<SignInResponse, ApiError>> {
    return await apiClient.post<SignInResponse>("/auth/signin", credentials);
  }

  /**
   * Sign up new user
   */
  static async signUp(userData: SignUpFormData): Promise<ApiResponse<SignUpResponse, ApiError>> {
    return await apiClient.post<SignUpResponse>("/auth/signup", userData);
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await apiClient.post("/auth/signout");
    } catch (error) {
      // Continue with local logout even if server call fails
      console.warn("Server logout failed, continuing with local logout:", error);
    }
  }
}
