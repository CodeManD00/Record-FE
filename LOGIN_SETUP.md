# 로그인 기능 설정 가이드

## 개요
Google 로그인 기능이 포함된 로그인 화면이 추가되었습니다.

## 설치된 파일

### 1. 로그인 페이지
- **위치**: `/src/pages/auth/LoginPage.tsx`
- **기능**: 
  - Google 로그인 버튼
  - 모던한 UI 디자인
  - 로딩 상태 표시
  - 에러 처리

### 2. 인증 서비스
- **위치**: `/src/services/auth/authService.ts`
- **기능**:
  - Google Sign-In 통합
  - 토큰 관리
  - 사용자 세션 관리
  - 백엔드 API 연동

## 설정 단계

### 1. 패키지 설치
```bash
npm install
# 또는
yarn install
```

### 2. Google Sign-In 설정

#### iOS 설정
1. Google Cloud Console에서 iOS 클라이언트 ID 생성
2. `ios/Record/Info.plist`에 URL 스킴 추가:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleTypeRole</key>
    <string>Editor</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR-CLIENT-ID</string>
    </array>
  </dict>
</array>
```

3. Pod 설치:
```bash
cd ios && pod install && cd ..
```

#### Android 설정
1. Google Cloud Console에서 Android 클라이언트 ID 생성
2. SHA-1 인증서 지문 등록
3. `android/app/build.gradle`에 이미 설정되어 있어야 합니다

### 3. 환경 변수 설정

`/src/services/auth/authService.ts` 파일에서 Google Web Client ID를 업데이트하세요:

```typescript
const GOOGLE_WEB_CLIENT_ID = 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com';
```

### 4. Google 아이콘 추가

`/src/assets/google_icon.png` 파일을 추가해야 합니다:
- 공식 Google "G" 로고 다운로드: https://developers.google.com/identity/branding-guidelines
- 권장 크기: 48x48px 이상
- 형식: PNG (투명 배경)

### 5. 백엔드 API 엔드포인트

백엔드에서 다음 엔드포인트를 구현해야 합니다:

#### POST `/auth/google`
Google ID 토큰으로 로그인/회원가입

**요청 본문**:
```json
{
  "idToken": "string",
  "email": "string",
  "name": "string",
  "profileImage": "string (optional)"
}
```

**응답**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "profileImage": "string",
      "provider": "google"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

#### POST `/auth/refresh`
액세스 토큰 갱신

**응답**:
```json
{
  "success": true,
  "data": {
    "accessToken": "string"
  }
}
```

#### GET `/auth/me`
현재 로그인한 사용자 정보 조회

**응답**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "profileImage": "string",
    "provider": "google"
  }
}
```

## 사용 방법

### 앱 실행
```bash
# iOS
npm run ios

# Android
npm run android
```

### 로그인 플로우
1. 앱 시작 시 로그인 화면이 표시됩니다
2. "Google로 계속하기" 버튼 클릭
3. Google 계정 선택
4. 로그인 성공 시 메인 화면으로 이동

### 로그아웃 추가 (선택사항)

로그아웃 기능을 추가하려면:

```typescript
import { authService } from '../services/auth/authService';

const handleLogout = async () => {
  const result = await authService.signOut();
  if (result.success) {
    // 로그인 화면으로 이동
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }
};
```

## 문제 해결

### Google Sign-In이 작동하지 않는 경우
1. Web Client ID가 올바른지 확인
2. iOS/Android 클라이언트 ID가 Google Cloud Console에 등록되어 있는지 확인
3. SHA-1 인증서 지문이 올바른지 확인 (Android)
4. 번들 ID가 일치하는지 확인 (iOS)

### 이미지가 표시되지 않는 경우
1. `google_icon.png` 파일이 `/src/assets/` 폴더에 있는지 확인
2. 파일 이름이 정확한지 확인
3. 앱을 다시 빌드

### 백엔드 연결 오류
1. API_BASE_URL이 올바른지 확인 (`/src/services/api/client.ts`)
2. 백엔드 서버가 실행 중인지 확인
3. 네트워크 연결 확인

## 추가 기능 제안

1. **Apple Sign-In**: iOS 사용자를 위한 Apple 로그인 추가
2. **이메일 로그인**: 이메일/비밀번호 로그인 옵션 추가
3. **자동 로그인**: 토큰 저장 및 자동 로그인 기능
4. **프로필 관리**: 사용자 프로필 편집 기능

## 참고 자료

- [React Native Google Sign-In 문서](https://github.com/react-native-google-signin/google-signin)
- [Google Identity 브랜딩 가이드라인](https://developers.google.com/identity/branding-guidelines)
- [React Navigation 문서](https://reactnavigation.org/)
