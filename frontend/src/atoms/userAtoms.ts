/**
 * 사용자 상태 관리 Atoms (Jotai) - 리팩토링된 버전
 * 사용자 프로필, 설정, 인증 정보를 관리합니다.
 * 
 * 주요 개선사항:
 * - 하드코딩된 초기값 제거 및 상수화
 * - 공통 에러 핸들링 패턴 통합
 * - 프로필 완성도 계산 최적화
 * - undefined 필드 처리 개선
 * - 인증 atom 확장성 향상
 * - 범용 필드 검증 시스템 구축
 * - 선택적 업데이트로 불필요한 렌더링 최소화
 * 
 * @author TicketBookApp Team
 * @version 2.0.0 (리팩토링됨)
 * @since 2025-01-15
 */

import { atom } from 'jotai';
import { UserProfile, UserSettings, UserAuth } from '../types/user';
import { AccountVisibility, UserRole } from '../types/enums';
import { Result, ResultFactory, ErrorFactory } from '../types/errors';
import {
  UpdateUserProfileData,
  UpdateUserSettingsData,
} from '../types/user';
import {
  createInitialUserProfile,
  createInitialUserSettings,
  createInitialUserAuth,
  createEmptyUserProfile,
  createEmptyUserSettings,
  createEmptyUserAuth,
  PROFILE_COMPLETENESS_FIELDS,
  PROFILE_FIELD_WEIGHTS,
} from '../constants/userDefaults';
import {
  withErrorHandling,
  validateFields,
  calculateWeightedCompleteness,
  filterDefinedFields,
  hasChanges,
  withTimestamp,
  safeMerge,
  ValidationRule,
} from '../utils/atomHelpers';

// ============= 기본 상태 Atoms =============
// 상수화된 초기값을 사용하여 하드코딩 제거 및 중앙 관리

/**
 * 사용자 프로필 정보 atom
 * 초기값은 상수 파일에서 관리되며 동적으로 생성됩니다.
 */
export const userProfileAtom = atom<UserProfile>(createInitialUserProfile());

/**
 * 사용자 설정 atom
 * 초기값은 상수 파일에서 관리됩니다.
 */
export const userSettingsAtom = atom<UserSettings>(createInitialUserSettings(''));

/**
 * 사용자 인증 정보 atom
 * 초기값은 상수 파일에서 관리됩니다.
 */
export const userAuthAtom = atom<UserAuth>(createInitialUserAuth(''));

/**
 * 확장된 인증 정보 atom (미래 확장성 고려)
 * 2FA, 세션 관리, 권한 등 추가 인증 기능을 위한 확장 포인트
 */
export const extendedAuthAtom = atom<{
  twoFactorEnabled?: boolean;
  sessionId?: string;
  permissions?: string[];
  lastPasswordChange?: Date;
  loginAttempts?: number;
  accountLocked?: boolean;
}>({});

// ============= 파생 상태 Atoms =============
// 기본 상태로부터 계산되는 파생 상태들

/**
 * 프로필 완성도 계산 atom (동적 필드 감지)
 * 가중치 기반 완성도 계산 및 누락 필드 정보 제공
 */
export const profileCompletenessAtom = atom<{
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
}>((get) => {
  const profile = get(userProfileAtom);
  
  // 가중치 기반 완성도 계산
  const percentage = calculateWeightedCompleteness(
    profile,
    PROFILE_FIELD_WEIGHTS,
    [...PROFILE_COMPLETENESS_FIELDS]
  );
  
  // 완료된 필드와 누락된 필드 계산
  const completedFields = PROFILE_COMPLETENESS_FIELDS.filter(
    field => profile[field] != null && profile[field] !== ''
  );
  
  const missingFields = PROFILE_COMPLETENESS_FIELDS.filter(
    field => profile[field] == null || profile[field] === ''
  );
  
  return {
    percentage,
    completedFields: completedFields.length,
    totalFields: PROFILE_COMPLETENESS_FIELDS.length,
    missingFields,
  };
});

/**
 * 프로필 완성도 백분율만 반환 (기존 호환성)
 */
export const profileCompletenessPercentageAtom = atom<number>((get) => {
  return get(profileCompletenessAtom).percentage;
});

// ============= 검증 규칙 =============

/**
 * 프로필 검증 규칙
 */
const PROFILE_VALIDATION_RULES: ValidationRule<UpdateUserProfileData>[] = [
  {
    field: 'name',
    validator: (name: string) => {
      if (name && name.trim().length === 0) {
        return new Error('이름은 비어있을 수 없습니다');
      }
      return null;
    }
  },
  {
    field: 'email',
    validator: (email: string) => {
      if (email && !email.includes('@')) {
        return new Error('올바른 이메일 형식이 아닙니다');
      }
      return null;
    }
  }
];

/**
 * 설정 검증 규칙
 */
const SETTINGS_VALIDATION_RULES: ValidationRule<UpdateUserSettingsData>[] = [
  {
    field: 'accountVisibility',
    validator: (visibility: string) => {
      if (visibility && !Object.values(AccountVisibility).includes(visibility as AccountVisibility)) {
        return new Error('올바르지 않은 계정 공개 설정입니다');
      }
      return null;
    }
  }
];

// ============= 쓰기 Atoms =============
// 상태 업데이트를 위한 쓰기 전용 atoms

/**
 * 사용자 프로필 업데이트 atom (리팩토링된 버전)
 * 공통 에러 핸들링, 검증, 선택적 업데이트 적용
 */
export const updateUserProfileAtom = atom(
  null,
  (get, set, updateData: UpdateUserProfileData): Result<UserProfile> => {
    return withErrorHandling(() => {
      const currentProfile = get(userProfileAtom);
      
      // 변경사항이 없으면 현재 프로필 반환
      if (!hasChanges(currentProfile, updateData)) {
        return currentProfile;
      }
      
      // 검증 수행
      const validationError = validateFields(updateData, PROFILE_VALIDATION_RULES);
      if (validationError) {
        throw validationError;
      }
      
      // 안전한 병합 및 타임스탬프 업데이트
      const updatedProfile = withTimestamp(safeMerge(currentProfile, updateData));
      set(userProfileAtom, updatedProfile);
      
      return updatedProfile;
    }, '프로필 업데이트 중 오류가 발생했습니다')();
  }
);

/**
 * 확장된 인증 정보 업데이트 atom (통합 인증 관리)
 * 기본 인증과 확장 인증을 함께 관리하는 통합 인터페이스
 */
export const updateExtendedAuthAtom = atom(
  null,
  (get, set, params: {
    auth?: Partial<UserAuth>;
    extended?: Partial<{
      twoFactorEnabled?: boolean;
      sessionId?: string;
      permissions?: string[];
      lastPasswordChange?: Date;
    }>;
  }): Result<boolean> => {
    return withErrorHandling(() => {
      // 기본 인증 정보 업데이트
      if (params.auth) {
        const currentAuth = get(userAuthAtom);
        if (hasChanges(currentAuth, params.auth)) {
          const updatedAuth = safeMerge(currentAuth, params.auth);
          set(userAuthAtom, updatedAuth);
        }
      }
      
      // 확장 인증 정보 업데이트
      if (params.extended) {
        const currentExtended = get(extendedAuthAtom);
        if (hasChanges(currentExtended, params.extended)) {
          const updatedExtended = safeMerge(currentExtended, params.extended);
          set(extendedAuthAtom, updatedExtended);
        }
      }
      
      return true;
    }, '확장 인증 정보 업데이트 중 오류가 발생했습니다')();
  }
);

/**
 * 사용자 인증 정보 업데이트 atom (리팩토링된 버전)
 * 공통 에러 핸들링 및 선택적 업데이트 적용
 */
export const updateUserAuthAtom = atom(
  null,
  (get, set, updateData: Partial<UserAuth>): Result<UserAuth> => {
    return withErrorHandling(() => {
      const currentAuth = get(userAuthAtom);
      
      // 변경사항이 없으면 현재 인증 정보 반환
      if (!hasChanges(currentAuth, updateData)) {
        return currentAuth;
      }
      
      // 안전한 병합 (인증 정보는 타임스탬프 업데이트 없음)
      const updatedAuth = safeMerge(currentAuth, updateData);
      set(userAuthAtom, updatedAuth);
      
      return updatedAuth;
    }, '인증 정보 업데이트 중 오류가 발생했습니다')();
  }
);

/**
 * 사용자 설정 업데이트 atom (리팩토링된 버전)
 * 공통 에러 핸들링, 검증, 선택적 업데이트 적용
 */
export const updateUserSettingsAtom = atom(
  null,
  (get, set, updateData: UpdateUserSettingsData): Result<UserSettings> => {
    return withErrorHandling(() => {
      const currentSettings = get(userSettingsAtom);
      
      // 변경사항이 없으면 현재 설정 반환
      if (!hasChanges(currentSettings, updateData)) {
        return currentSettings;
      }
      
      // 검증 수행
      const validationError = validateFields(updateData, SETTINGS_VALIDATION_RULES);
      if (validationError) {
        throw validationError;
      }
      
      // 안전한 병합 및 타임스탬프 업데이트
      const updatedSettings = withTimestamp(safeMerge(currentSettings, updateData));
      set(userSettingsAtom, updatedSettings);
      
      return updatedSettings;
    }, '설정 업데이트 중 오류가 발생했습니다')();
  }
);

/**
 * 로그인 시간 업데이트 atom
 * 사용자 로그인 시 마지막 로그인 시간을 업데이트합니다.
 */
export const updateLastLoginAtom = atom(
  null,
  (get, set): Result<boolean> => {
    return withErrorHandling(() => {
      const currentAuth = get(userAuthAtom);
      const updatedAuth = safeMerge(currentAuth, { lastLoginAt: new Date() });
      set(userAuthAtom, updatedAuth);
      return true;
    }, '로그인 시간 업데이트 중 오류가 발생했습니다')();
  }
);

/**
 * 이메일 인증 상태 업데이트 atom
 */
export const updateEmailVerificationAtom = atom(
  null,
  (get, set, isVerified: boolean): Result<boolean> => {
    return withErrorHandling(() => {
      const currentAuth = get(userAuthAtom);
      const updatedAuth = safeMerge(currentAuth, { isEmailVerified: isVerified });
      set(userAuthAtom, updatedAuth);
      return true;
    }, '이메일 인증 상태 업데이트 중 오류가 발생했습니다')();
  }
);

// ============= 파생 상태 Atoms (추가) =============

/**
 * 현재 사용자 ID atom
 */
export const currentUserIdAtom = atom<string>((get) => {
  return get(userProfileAtom).id;
});

/**
 * 사용자 표시 이름 atom
 */
export const userDisplayNameAtom = atom<string>((get) => {
  const profile = get(userProfileAtom);
  return profile.name || profile.username || '사용자';
});

/**
 * 계정 공개 여부 atom
 */
export const isAccountPublicAtom = atom<boolean>((get) => {
  const settings = get(userSettingsAtom);
  return settings.accountVisibility === AccountVisibility.PUBLIC;
});

// ============= 유틸리티 Atoms =============

/**
 * 사용자 데이터 초기화 atom (로그아웃 시 사용)
 * 상수화된 빈 값을 사용하여 일관성 보장
 */
export const resetUserDataAtom = atom(
  null,
  (get, set): void => {
    set(userProfileAtom, createEmptyUserProfile());
    set(userSettingsAtom, createEmptyUserSettings());
    set(userAuthAtom, createEmptyUserAuth());
    set(extendedAuthAtom, {});
  }
);
