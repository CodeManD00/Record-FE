/**
 * 사용자 관련 기본값 상수
 * 하드코딩된 초기값을 중앙화하여 관리
 * 
 * @author TicketBookApp Team
 * @version 1.0.0
 * @since 2025-09-15
 */

import { UserProfile, UserSettings, UserAuth } from '../types/user';
import { AccountVisibility, UserRole } from '../types/enums';
import { IdGenerator } from '../utils/idGenerator';

/**
 * 사용자 프로필 기본값
 */
export const DEFAULT_USER_PROFILE: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '사용자',
  username: 'user1234',
  email: 'user@example.com',
  profileImage: undefined,
  bio: undefined,
} as const;

/**
 * 사용자 설정 기본값
 */
export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'userId' | 'updatedAt'> = {
  accountVisibility: AccountVisibility.PUBLIC,
  allowFriendRequests: true,
  showTicketsToFriends: true,
  emailNotifications: true,
  pushNotifications: true,
  language: 'ko',
  theme: 'system',
} as const;

/**
 * 사용자 인증 기본값
 */
export const DEFAULT_USER_AUTH: Omit<UserAuth, 'userId' | 'createdAt' | 'lastLoginAt'> = {
  role: UserRole.USER,
  isEmailVerified: false,
} as const;

/**
 * 프로필 완성도 계산을 위한 필수 필드 정의
 * 새 필드 추가 시 자동으로 완성도 계산에 반영됨
 */
export const PROFILE_COMPLETENESS_FIELDS = [
  'name',
  'username', 
  'email',
  'profileImage',
  'bio'
] as const;

/**
 * 프로필 필드별 가중치 (선택적 사용)
 */
export const PROFILE_FIELD_WEIGHTS = {
  name: 1.5,        // 이름은 더 중요
  username: 1.5,    // 사용자명도 중요
  email: 1.5,       // 이메일도 중요
  profileImage: 1.0, // 프로필 이미지는 기본 가중치
  bio: 0.8,         // 자기소개는 상대적으로 덜 중요
} as const;

/**
 * 빈 사용자 데이터 생성 함수
 */
export const createEmptyUserProfile = (): UserProfile => ({
  id: '',
  name: '',
  username: '',
  email: '',
  profileImage: undefined,
  bio: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createEmptyUserSettings = (): UserSettings => ({
  userId: '',
  ...DEFAULT_USER_SETTINGS,
  updatedAt: new Date(),
});

export const createEmptyUserAuth = (): UserAuth => ({
  userId: '',
  ...DEFAULT_USER_AUTH,
  createdAt: new Date(),
  lastLoginAt: undefined,
});

/**
 * 초기 사용자 데이터 생성 함수
 */
export const createInitialUserProfile = (): UserProfile => {
  const now = new Date();
  const userId = IdGenerator.user();
  
  return {
    id: userId,
    ...DEFAULT_USER_PROFILE,
    createdAt: now,
    updatedAt: now,
  };
};

export const createInitialUserSettings = (userId: string): UserSettings => ({
  userId,
  ...DEFAULT_USER_SETTINGS,
  updatedAt: new Date(),
});

export const createInitialUserAuth = (userId: string): UserAuth => ({
  userId,
  ...DEFAULT_USER_AUTH,
  createdAt: new Date(),
  lastLoginAt: new Date(),
});
