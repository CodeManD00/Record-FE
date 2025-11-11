/**
 * Authentication Service
 * Handles user authentication including Google Sign-In
 */

import { Result, ResultFactory, ErrorFactory } from '../../utils/result';
import { apiClient } from '../api/client';

/**
 * User authentication data
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider: 'google' | 'apple' | 'email';
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Google Sign-In configuration
 */
const GOOGLE_WEB_CLIENT_ID = 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com';

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    this.configureGoogleSignIn();
  }

  /**
   * Configure Google Sign-In
   */
  private configureGoogleSignIn() {
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
    } catch (error) {
      console.error('Failed to configure Google Sign-In:', error);
    }
  }

  /**
   * Sign up with username, password, email, and nickname
   */
  async signUp(
    username: string,
    password: string,
    email: string,
    nickname: string
  ): Promise<Result<AuthResponse>> {
    try {
      // Send registration data to backend
      const result = await apiClient.post<AuthResponse>('/auth/signup', {
        username,
        password,
        email,
        nickname,
      });

      if (result.success && result.data) {
        // Store auth token
        apiClient.setAuthToken(result.data.accessToken);
        
        // Store current user
        this.currentUser = result.data.user;

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
        this.currentUser = result.data.user;

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
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<Result<AuthResponse>> {
    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Get user info from Google
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.data?.user) {
        return ResultFactory.failure(
          ErrorFactory.validation('Google 로그인 정보를 가져올 수 없습니다')
        );
      }

      const googleUser = userInfo.data.user;
      const idToken = userInfo.data.idToken;

      // Send token to backend for verification and user creation/login
      const result = await apiClient.post<AuthResponse>('/auth/google', {
        idToken,
        email: googleUser.email,
        name: googleUser.name,
        profileImage: googleUser.photo,
      });

      if (result.success && result.data) {
        // Store auth token
        apiClient.setAuthToken(result.data.accessToken);
        
        // Store current user
        this.currentUser = result.data.user;

        return result;
      }

      return result;
    } catch (error: any) {
      console.error('Google Sign-In error:', error);

      // Handle specific Google Sign-In errors
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return ResultFactory.failure(
          ErrorFactory.validation('로그인이 취소되었습니다')
        );
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return ResultFactory.failure(
          ErrorFactory.validation('로그인이 진행 중입니다')
        );
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return ResultFactory.failure(
          ErrorFactory.validation('Google Play Services를 사용할 수 없습니다')
        );
      }

      return ResultFactory.failure(
        ErrorFactory.unknown('Google 로그인 중 오류가 발생했습니다')
      );
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<Result<void>> {
    try {
      // Sign out from Google
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
      }

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
      const isSignedIn = await GoogleSignin.isSignedIn();
      return isSignedIn;
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
