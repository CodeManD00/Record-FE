/**
 * Authentication Service
 * Handles user authentication with email and password
 */

import { Result, ResultFactory, ErrorFactory } from '../../utils/result';
import { apiClient } from '../api/client';
import { Platform } from 'react-native';

/**
 * User authentication data
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider: 'email';
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  id: AuthUser;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    // Initialize any required services here
  }

  /**
   * Sign up with username, password, email, and nickname
   */
  async signUp(
    id: string,
    password: string,
    email: string,
    nickname: string
  ): Promise<Result<AuthResponse>> {
    try {
      // Send registration data to backend
      const result = await apiClient.post<AuthResponse>('/auth/signup', {
        id,
        email,
        password,
        nickname,
      });

      if (result.success && result.data) {
        // Store auth token
        apiClient.setAuthToken(result.data.accessToken);
        
        // Store current user
        this.currentUser = result.data.id;

        return result;
      }

      return result;
    } catch (error: any) {
      console.error('Sign up error:', error);
      return ResultFactory.failure(
        ErrorFactory.unknown('회원가입 중 오류가 발생했습니다')
      );
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<Result<AuthResponse>> {
    try {
      // Send credentials to backend for authentication
      const result = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      if (result.success && result.data) {
        // Store auth token
        apiClient.setAuthToken(result.data.accessToken);
        
        // Store current user
        this.currentUser = result.data.id;

        return result;
      }

      return result;
    } catch (error: any) {
      console.error('Email Sign-In error:', error);
      return ResultFactory.failure(
        ErrorFactory.unknown('로그인 중 오류가 발생했습니다')
      );
    }
  }

  /**
   * Handle password reset request
   */
  async requestPasswordReset(email: string): Promise<Result<{ message: string }>> {
    try {
      const result = await apiClient.post<{ message: string }>('/auth/request-password-reset', { email });
      return result;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      return ResultFactory.failure(
        ErrorFactory.unknown('비밀번호 재설정 요청 중 오류가 발생했습니다')
      );
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<Result<void>> {
    try {
      // Clear auth token
      apiClient.clearAuthToken();

      // Clear current user
      this.currentUser = null;

      return ResultFactory.success(undefined);
    } catch (error: any) {
      console.error('Sign out error:', error);
      return ResultFactory.failure(
        ErrorFactory.unknown('로그아웃 중 오류가 발생했습니다')
      );
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check if we have a valid access token
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    // In a real implementation, you would get this from secure storage
    // For now, we'll return null and let the API client handle it
    return null;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<Result<string>> {
    try {
      const result = await apiClient.post<{ accessToken: string }>('/auth/refresh');
      
      if (result.success && result.data) {
        apiClient.setAuthToken(result.data.accessToken);
        return ResultFactory.success(result.data.accessToken);
      }

      return ResultFactory.failure(
        ErrorFactory.unauthorized()
      );
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.unknown('토큰 갱신 중 오류가 발생했습니다')
      );
    }
  }

  /**
   * Get current user from backend
   */
  async fetchCurrentUser(): Promise<Result<AuthUser>> {
    try {
      const result = await apiClient.get<AuthUser>('/auth/me');
      
      if (result.success && result.data) {
        this.currentUser = result.data;
        return result;
      }

      return result;
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.unknown('사용자 정보를 가져올 수 없습니다')
      );
    }
  }
}

// Singleton instance
export const authService = new AuthService();
export default authService;
