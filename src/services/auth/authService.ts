/**
 * Authentication Service
 * Handles user authentication with email and password
 */

import { Result, ResultFactory, ErrorFactory } from '../../utils/result';
import { apiClient } from '../api/client';
import { Platform } from 'react-native';

/**
 * 현재 로그인한 사용자 정보
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider: 'email';
}

/**
 * 백엔드 로그인/회원가입 응답 형식
 */
export interface AuthResponse {
  token: string;      // JWT 토큰
  type: string;       // "Bearer"
  expiresIn: number; // 만료 시간 (ms)
  role: string;       // "USER" | "ADMIN"
}


/*
 * 현재 로그인한 사용자 정보
 */
class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    // Initialize any required services here
  }

  /**
   * 회원가입용 이메일 인증 코드 발송
   */
    async sendSignupVerificationCode(email: string): Promise<Result<string>> {
    try {
      const result = await apiClient.post<string>('/auth/email/send-code', { email });
      return result;
    } catch (error: any) {
      console.error('Send signup verification code error:', error);
      return ResultFactory.failure(
        ErrorFactory.unknown('회원가입 인증 코드 발송 중 오류가 발생했습니다')
      );
    }
  }

  /**
   * 회원가입용 이메일 인증 코드 검증
   */
  async verifySignupCode(email: string, code: string): Promise<Result<string>> {
    try {
      const result = await apiClient.post<string>('/auth/email/verify', { email, code });
      return result;
    } catch (error: any) {
      console.error('Verify signup code error:', error);
      return ResultFactory.failure(
        ErrorFactory.unknown('회원가입 인증 코드 검증 중 오류가 발생했습니다')
      );
    }
  }

  /**
   * 회원가입
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
        // 회원가입 시에는 토큰을 저장하지 않음 (회원가입 후 자동 로그인 방지)
        // 사용자가 직접 로그인 화면에서 로그인해야 함

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
   * 로그인
   */
  async signInWithId(id: string, password: string): Promise<Result<AuthResponse>> {
    try {
      // Send credentials to backend for authentication
      const result = await apiClient.post<AuthResponse>('/auth/login', {
        id,
        password,
      });

      if (result.success && result.data) {
        // 백엔드 응답: { token, type, expiresIn, role }
        // Store auth token
        apiClient.setAuthToken(result.data.token);
        
        // Store current user (id는 별도로 조회해야 함)
        // TODO: 사용자 정보를 별도 API로 조회하거나, 로그인 응답에 포함시켜야 함

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
   * 비밀번호 재설정 요청
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
   * 로그아웃
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
   * 인증상태 확인 - 토큰 여부
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
   * 현재 사용자 조회
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
