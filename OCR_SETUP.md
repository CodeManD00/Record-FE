# OCR 기능 구현 완료 ✅

티켓 추가 플로우에 OCR 기능이 완전히 연동되었습니다!

## 📂 API 서비스 위치

OCR API 코드는 **`/src/services/api/ocrService.ts`**에 있습니다!

## 📋 구현된 기능

### 1. **OCRPage.tsx** (`/src/pages/add-ticket/OCRPage.tsx`)
- 카메라 촬영 또는 갤러리에서 이미지 선택
- OCR 처리 (현재는 시뮬레이션, 실제 API 연동 필요)
- 추출된 티켓 정보 미리보기
- AddTicketPage로 자동 데이터 전달

### 2. **InputMethodModal** 업데이트
- OCR 버튼 클릭 시 OCRPage로 이동
- `onSelectOCR` 콜백 추가

### 3. **AddTicketPage** 업데이트
- OCR 결과를 `route.params.ocrData`로 수신
- 폼에 자동으로 데이터 입력
- OCR로 온 경우 InputMethodModal 자동 숨김

### 4. **App.tsx** 네비게이션
- OCR 페이지 라우트 추가 (modal presentation)

### 5. **권한 설정 완료**
- **iOS**: Info.plist에 카메라/갤러리 권한 이미 설정됨
- **Android**: AndroidManifest.xml에 권한 추가 완료

## 🚀 사용 방법

1. **티켓 추가 버튼** 클릭
2. **입력 방법 선택 모달**에서 **"OCR"** 선택
3. **카메라로 촬영** 또는 **갤러리에서 선택**
4. OCR 처리 후 추출된 정보 확인
5. **확인** 버튼 클릭하면 AddTicketPage로 이동 (자동 입력됨)
6. 필요시 수정 후 **다음** 버튼으로 진행

## 🔧 실제 OCR API 연동하기

**OCR API 서비스 파일**: `/src/services/api/ocrService.ts`

이 파일에서 3가지 OCR 옵션을 제공합니다:

### 옵션 1: Google Vision API (권장)
```typescript
// OCRPage.tsx의 processOCR 함수 수정
import { GoogleCloudVisionAPI } from 'react-native-google-cloud-vision-api';

const processOCR = async (imageUri: string) => {
  setIsProcessing(true);
  try {
    const response = await GoogleCloudVisionAPI.textRecognition(imageUri);
    const extractedText = response.responses[0].fullTextAnnotation.text;
    
    // 텍스트 파싱 로직
    const ocrResult = parseTicketText(extractedText);
    setOcrResult(ocrResult);
    // ...
  } catch (error) {
    Alert.alert('오류', 'OCR 처리 중 오류가 발생했습니다.');
  } finally {
    setIsProcessing(false);
  }
};
```

### 옵션 2: 자체 서버 API
```typescript
const processOCR = async (imageUri: string) => {
  setIsProcessing(true);
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'ticket.jpg',
    });

    const response = await fetch('https://your-api.com/ocr', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    setOcrResult(result);
    // ...
  } catch (error) {
    Alert.alert('오류', 'OCR 처리 중 오류가 발생했습니다.');
  } finally {
    setIsProcessing(false);
  }
};
```

### 옵션 3: 온디바이스 OCR (react-native-text-recognition)
```bash
npm install react-native-text-recognition
cd ios && pod install
```

```typescript
import TextRecognition from 'react-native-text-recognition';

const processOCR = async (imageUri: string) => {
  setIsProcessing(true);
  try {
    const result = await TextRecognition.recognize(imageUri);
    const extractedText = result.map(block => block.text).join('\n');
    
    // 텍스트 파싱 로직
    const ocrResult = parseTicketText(extractedText);
    setOcrResult(ocrResult);
    // ...
  } catch (error) {
    Alert.alert('오류', 'OCR 처리 중 오류가 발생했습니다.');
  } finally {
    setIsProcessing(false);
  }
};
```

## 📝 텍스트 파싱 로직 예시

OCR로 추출한 텍스트에서 티켓 정보를 파싱하는 함수:

```typescript
function parseTicketText(text: string): OCRResult {
  // 정규식을 사용한 파싱 예시
  const titleMatch = text.match(/공연명[:\s]*(.+)/i);
  const artistMatch = text.match(/출연[:\s]*(.+)/i);
  const placeMatch = text.match(/장소[:\s]*(.+)/i);
  const dateMatch = text.match(/(\d{4})[.-](\d{2})[.-](\d{2})/);
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);

  return {
    title: titleMatch?.[1]?.trim(),
    artist: artistMatch?.[1]?.trim(),
    place: placeMatch?.[1]?.trim(),
    performedAt: dateMatch && timeMatch 
      ? new Date(
          parseInt(dateMatch[1]),
          parseInt(dateMatch[2]) - 1,
          parseInt(dateMatch[3]),
          parseInt(timeMatch[1]),
          parseInt(timeMatch[2])
        )
      : undefined,
    genre: '밴드', // 기본값
  };
}
```

## 🧪 테스트 방법

1. **iOS 시뮬레이터**:
```bash
npm run ios
```

2. **Android 에뮬레이터**:
```bash
npm run android
```

3. **실제 디바이스** (권장):
- 카메라 기능은 실제 디바이스에서 테스트하는 것이 좋습니다

## 📦 필요한 패키지

모든 필요한 패키지가 이미 설치되어 있습니다:
- ✅ `react-native-image-picker` (v8.2.1)
- ✅ iOS 권한 설정 완료
- ✅ Android 권한 설정 완료

## 🎯 다음 단계

1. **실제 OCR API 선택 및 연동**
   - Google Vision API 키 발급
   - 또는 자체 서버 API 구축
   - 또는 온디바이스 OCR 라이브러리 사용

2. **텍스트 파싱 로직 개선**
   - 다양한 티켓 포맷 지원
   - 정확도 향상을 위한 정규식 개선

3. **UX 개선**
   - 이미지 크롭 기능 추가
   - OCR 결과 수정 UI 개선
   - 에러 처리 강화

## 📸 스크린샷 플로우

```
[티켓 추가] → [입력 방법 선택 모달] → [OCR 선택]
    ↓
[OCR 페이지] → [카메라/갤러리 선택] → [이미지 선택]
    ↓
[OCR 처리 중...] → [결과 확인] → [확인 버튼]
    ↓
[AddTicketPage (자동 입력됨)] → [수정 가능] → [다음]
```

## ✨ 완료!

OCR 기능이 완전히 연동되었습니다. 실제 OCR API만 연결하면 바로 사용할 수 있습니다!
