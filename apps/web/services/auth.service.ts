/**
 * Authentication Service
 * ======================
 * Handles all authentication-related API operations
 */

import { apiClient } from "@/lib/axios";
import { SignInFormData, SignUpFormData } from "@/lib/schemas/auth-schemas";
import { ApiResponse, ApiError } from "@repo/types";

// API request/response types
interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

interface SignUpRequest {
  email: string;
  username: string;
  password: string;
  displayName: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export class AuthService {
  private static readonly ENDPOINTS = {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    REFRESH: "/auth/refresh",
  } as const;

  /**
   * Sign in user with credentials
   */
  static async signIn(credentials: SignInFormData): Promise<ApiResponse<AuthResponse, ApiError>> {
    const loginData: LoginRequest = {
      usernameOrEmail: credentials.emailOrUsername,
      password: credentials.password,
    };

    return apiClient.post<AuthResponse>(AuthService.ENDPOINTS.LOGIN, loginData);
  }

  /**
   * Register new user
   */
  static async signUp(userData: SignUpFormData): Promise<ApiResponse<AuthResponse, ApiError>> {
    const signUpData: SignUpRequest = {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      displayName: userData.name,
    };

    return apiClient.post<AuthResponse>(AuthService.ENDPOINTS.SIGNUP, signUpData);
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse, ApiError>> {
    const refreshData: RefreshTokenRequest = { refreshToken };

    return apiClient.post<AuthResponse>(AuthService.ENDPOINTS.REFRESH, refreshData);
  }

  /**
   * Sign out user (clears local tokens only)
   */
  static async signOut(): Promise<void> {
    // No server call needed - just clear local storage
  }
}
