/**
 * 사용자 관련 타입 정의
 * 프로필, 설정, 인증 정보를 분리하여 관리
 */

import { UserRole, AccountVisibility } from './enums';

/**
 * 사용자 기본 프로필 정보
 */
export interface UserProfile {
  readonly id: string;
  name: string;
  username: string;
  userId?: string;
  email: string;
  profileImage?: string;
  bio?: string;
  isAccountPrivate?: boolean;
  readonly createdAt: Date;
  updatedAt: Date;
}

/**
 * 사용자 계정 설정
 */
export interface UserSettings {
  readonly userId: string;
  accountVisibility: AccountVisibility;
  allowFriendRequests: boolean;
  showTicketsToFriends: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: 'ko' | 'en';
  theme: 'light' | 'dark' | 'system';
  updatedAt: Date;
}

/**
 * 사용자 인증 정보 (민감한 정보)
 */
export interface UserAuth {
  readonly userId: string;
  readonly role: UserRole;
  lastLoginAt?: Date;
  isEmailVerified: boolean;
  readonly createdAt: Date;
}

/**
 * 완전한 사용자 정보 (모든 정보 포함)
 */
export interface User {
  profile: UserProfile;
  settings: UserSettings;
  auth: UserAuth;
}

/**
 * 사용자 프로필 업데이트용 데이터
 */
export interface UpdateUserProfileData extends Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>> {}

/**
 * 사용자 설정 업데이트용 데이터
 */
export interface UpdateUserSettingsData extends Partial<Omit<UserSettings, 'userId' | 'updatedAt'>> {}

/**
 * 사용자 생성용 데이터
 */
export interface CreateUserData extends Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
  settings?: Partial<Omit<UserSettings, 'userId' | 'updatedAt'>>;
}
