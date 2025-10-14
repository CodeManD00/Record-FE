/**
 * 사용자 관련 API 서비스
 * 프로필, 인증, 설정 등의 API 호출 함수들
 */

import { apiClient } from './client';
import { Result } from '../../utils/result';

/**
 * 사용자 프로필 타입
 */
export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 로그인 데이터
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * 회원가입 데이터
 */
export interface RegisterData {
  name: string;
  username: string;
  email: string;
  password: string;
}

/**
 * 프로필 업데이트 데이터
 */
export interface UpdateProfileData {
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
}

/**
 * 비밀번호 변경 데이터
 */
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * 인증 응답
 */
export interface AuthResponse {
  user: UserProfile;
  token: string;
  refreshToken: string;
}

/**
 * 사용자 서비스 클래스
 */
class UserService {
  /**
   * 로그인
   */
  async login(data: LoginData): Promise<Result<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/login', data);
  }

  /**
   * 회원가입
   */
  async register(data: RegisterData): Promise<Result<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<Result<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/logout');
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(refreshToken: string): Promise<Result<{ token: string; refreshToken: string }>> {
    return apiClient.post<{ token: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    });
  }

  /**
   * 내 프로필 조회
   */
  async getMyProfile(): Promise<Result<UserProfile>> {
    return apiClient.get<UserProfile>('/users/me');
  }

  /**
   * 프로필 업데이트
   */
  async updateProfile(data: UpdateProfileData): Promise<Result<UserProfile>> {
    return apiClient.put<UserProfile>('/users/me', data);
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(data: ChangePasswordData): Promise<Result<{ success: boolean }>> {
    return apiClient.put<{ success: boolean }>('/users/me/password', data);
  }

  /**
   * 프로필 이미지 업로드
   */
  async uploadProfileImage(imageUri: string, fileName?: string): Promise<Result<{ imageUrl: string }>> {
    const formData = new FormData();
    
    // React Native에서 이미지 업로드
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg', // 또는 동적으로 결정
      name: fileName || 'profile.jpg',
    } as any);

    return apiClient.post<{ imageUrl: string }>('/users/me/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 사용자 검색
   */
  async searchUsers(query: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<Result<{
    users: UserProfile[];
    total: number;
    hasMore: boolean;
  }>> {
    const queryParams = new URLSearchParams({ search: query });
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return apiClient.get(`/users/search?${queryParams.toString()}`);
  }

  /**
   * 사용자 프로필 조회 (다른 사용자)
   */
  async getUserProfile(userId: string): Promise<Result<UserProfile>> {
    return apiClient.get<UserProfile>(`/users/${userId}`);
  }

  /**
   * 계정 삭제
   */
  async deleteAccount(password: string): Promise<Result<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>('/users/me', { password });
  }

  /**
   * 이메일 인증 요청
   */
  async requestEmailVerification(): Promise<Result<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/verify-email/request');
  }

  /**
   * 이메일 인증 확인
   */
  async verifyEmail(token: string): Promise<Result<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/verify-email/confirm', { token });
  }

  /**
   * 비밀번호 재설정 요청
   */
  async requestPasswordReset(email: string): Promise<Result<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/password-reset/request', { email });
  }

  /**
   * 비밀번호 재설정 확인
   */
  async resetPassword(token: string, newPassword: string): Promise<Result<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>('/auth/password-reset/confirm', {
      token,
      newPassword,
    });
  }

  /**
   * 사용자 설정 조회
   */
  async getUserSettings(): Promise<Result<{
    notifications: {
      friendRequests: boolean;
      newTickets: boolean;
      reminders: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      ticketVisibility: 'public' | 'friends' | 'private';
    };
  }>> {
    return apiClient.get('/users/me/settings');
  }

  /**
   * 사용자 설정 업데이트
   */
  async updateUserSettings(settings: {
    notifications?: {
      friendRequests?: boolean;
      newTickets?: boolean;
      reminders?: boolean;
    };
    privacy?: {
      profileVisibility?: 'public' | 'friends' | 'private';
      ticketVisibility?: 'public' | 'friends' | 'private';
    };
  }): Promise<Result<{ success: boolean }>> {
    return apiClient.put<{ success: boolean }>('/users/me/settings', settings);
  }
}

// 싱글톤 인스턴스 생성
export const userService = new UserService();
export default userService;
