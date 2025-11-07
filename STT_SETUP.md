# STT 기능 설정 가이드

## 1. 필요한 라이브러리 설치

```bash
# React Native 오디오 녹음 라이브러리
npm install react-native-audio-recorder-player

# iOS 설정
cd ios && pod install && cd ..
```

## 2. 권한 설정

### iOS (ios/RecordFE/Info.plist)
```xml
<key>NSMicrophoneUsageDescription</key>
<string>후기 작성을 위해 마이크 권한이 필요합니다.</string>
```

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## 3. 백엔드 서버 실행

```bash
# Record-BE 디렉토리에서
./gradlew bootRun

# 또는
./gradlew build
java -jar build/libs/record-0.0.1-SNAPSHOT.jar
```

백엔드가 `http://localhost:8080`에서 실행되어야 합니다.

## 4. 사용 방법

### AddReviewPage에서:

1. **녹음 시작**: 🎤 버튼 클릭
2. **녹음 중지**: ⏹ 버튼 클릭 (자동으로 STT 처리 시작)
3. **STT 처리**: ⏳ 표시되며 백엔드로 파일 전송 및 변환
4. **완료**: 변환된 텍스트가 후기 입력창에 자동 추가

### 후기 요약:
- "후기 요약하기" 버튼 클릭
- 백엔드 GPT API로 요약 생성

## 5. API 엔드포인트

### STT 변환 (저장 안 함)
```
POST /stt/transcribe-only
Content-Type: multipart/form-data
Body: { file: AudioFile }
```

### STT 변환 + DB 저장
```
POST /stt/transcribe-and-save
Content-Type: multipart/form-data
Body: { file: AudioFile }
Authorization: Bearer {token}
```

### 텍스트 요약
```
POST /reviews/summaries
Content-Type: application/json
Body: { rawText: string, transcriptionId?: number }
Authorization: Bearer {token}
```

## 6. 구현된 파일

- ✅ `/src/services/api/sttService.ts` - STT API 서비스
- ✅ `/src/utils/audioRecorder.ts` - 오디오 녹음 유틸리티
- ✅ `/src/pages/add-ticket/AddReviewPage.tsx` - STT 통합

## 7. 주의사항

### iOS 시뮬레이터
- 마이크 권한이 자동으로 허용됨
- `127.0.0.1:8080`으로 로컬 서버 접근

### Android 에뮬레이터
- 마이크 권한 수동 허용 필요
- `10.0.2.2:8080`으로 로컬 서버 접근 (필요시 sttService.ts 수정)

### 실제 디바이스
- 컴퓨터와 같은 네트워크에 연결
- `client.ts`의 API_BASE_URL을 컴퓨터의 로컬 IP로 변경
  예: `http://192.168.0.10:8080`

## 8. 트러블슈팅

### "녹음을 시작할 수 없습니다"
- 권한 설정 확인
- 앱 재시작 후 권한 다시 허용

### "STT 변환에 실패했습니다"
- 백엔드 서버 실행 확인
- 네트워크 연결 확인
- 콘솔 로그 확인 (`console.log` 출력)

### Android에서 파일 업로드 실패
- `android/app/src/main/AndroidManifest.xml`에 권한 추가 확인
- 파일 경로 확인 (Android는 `file://` prefix 필요)

## 9. 다음 단계

- [ ] 실제 디바이스에서 테스트
- [ ] 에러 처리 개선
- [ ] 로딩 UI 개선 (Alert 대신 커스텀 로딩 컴포넌트)
- [ ] 녹음 시간 표시
- [ ] 녹음 파일 미리듣기 기능
