/**
 * Authentication Service
 * ====================
 *
 * Handles all authentication-related API operations including:
 * - User sign in/login
 * - User registration/signup
 * - Token refresh
 * - Sign out
 *
 * This service maps frontend form data to the exact API format
 * expected by the NestJS backend and transforms responses back
 * to frontend-compatible formats.
 *
 * API Endpoints:
 * - POST /auth/login    - User login
 * - POST /auth/signup   - User registration
 * - POST /auth/refresh  - Token refresh
 *
 * @author Mohamed Hesham
 */

import { apiClient } from "@/lib/axios";
import { SignInFormData, SignUpFormData } from "@/lib/schemas/auth-schemas";
import { ApiResponse, ApiError, LoginResponse, SignUpResponse } from "@repo/types";

// Response types to match frontend expectations
export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export class AuthService {
  /**
   * Sign in user with credentials
   * Maps frontend form data to backend LoginDto format
   */
  static async signIn(credentials: SignInFormData): Promise<ApiResponse<SignInResponse, ApiError>> {
    // Map form data to API expected format (LoginDto)
    const loginData = {
      usernameOrEmail: credentials.emailOrUsername,
      password: credentials.password,
    };

    return await apiClient.post<LoginResponse>("/auth/login", loginData);
  }

  /**
   * Sign up new user
   */
  static async signUp(userData: SignUpFormData): Promise<ApiResponse<SignUpResponse, ApiError>> {
    // Map form data to API expected format (SignupDto)
    const signupData = {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      displayName: userData.name,
    };

    return await apiClient.post<SignUpResponse>("/auth/signup", signupData);
  }

  /**
   * Refresh authentication token
   * Uses RefreshTokenDto format
   */
  static async refreshToken(refreshToken: string): Promise<ApiResponse<SignInResponse, ApiError>> {
    return await apiClient.post<LoginResponse>("/auth/refresh", { refreshToken });
  }

  /**
   * Sign out current user
   * so we just clear local tokens
   */
  static async signOut(): Promise<void> {}
}
