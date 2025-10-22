/**
 * OCR API 서비스
 */

import { ApiResponse } from './client';

const API_BASE_URL = 'http://localhost:8080'; // 로컬 개발용
const USE_MOCK_DATA = false; // 서버 없이 테스트할 때 true로 설정

/**
 * OCR 결과 타입 정의
 * 백엔드에서 반환하는 주요 공연 정보 필드
 */
export interface OCRResult {
  title?: string;
  artist?: string;
  place?: string;
  performedAt?: string;
}

/**
 * OCR 서비스 객체
 * - 백엔드 OCR API를 호출하는 비동기 함수 포함
 */
export const ocrService = {
  /**
   * 티켓 이미지에서 공연 정보를 추출
   * @param imageUri - React Native의 이미지 URI
   * @returns OCRResult | null - 공연 정보 또는 실패 시 null
   */
  async extractTicketInfo(imageUri: string): Promise<OCRResult | null> {
    console.log('extractTicketInfo - 이미지URI:', imageUri);
    /*
    // 목 데이터 모드: 서버 없이 테스트용
    if (USE_MOCK_DATA) {
      console.log('🧪 목 데이터 모드로 OCR 실행');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500)); // 로딩 시뮬레이션
      
      return {
        title: '2024 밴드 페스티벌',
        artist: '혁오',
        place: '올림픽공원 88잔디마당',
        performedAt: '2024-10-25T19:00:00',
      };
    }
    // 실제 서버 호출
    try {
      // 디버깅: 이미지 URI 확인
      console.log('🔍 OCR 요청 시작 - 이미지 URI:', imageUri);
      
      // 백엔드 API는 MultipartFile을 받으므로 FormData로 전송
      const formData = new FormData();
      
      // 이미지 파일을 FormData에 추가
      // React Native에서는 uri를 직접 사용할 수 있음
      const fileData = {
        uri: imageUri,
        type: 'image/jpeg', // 또는 image/png
        name: 'ticket.jpg',
      } as any;
      
      // 디버깅: FormData 구성 확인
      console.log('📁 FormData 파일 정보:', fileData);
      
      formData.append('file', fileData);

      console.log('FormData 생성 완료');

      // 2. 백엔드 /ocr/extract 엔드포인트 호출
      const response = await fetch(`${API_BASE_URL}/ocr/extract`, {
        method: 'POST',
        //headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
        // FormData 사용 시 Content-Type 헤더를 설정하지 않음 (자동으로 boundary 설정됨)
      });

      // 디버깅: 응답 상태 확인
      console.log('📡 백엔드 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 백엔드 오류 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ 백엔드 OCR 결과:', result);
      
      // 백엔드 응답을 OCRResult 형식으로 변환
      const ocrResult: OCRResult = {
        title: result.title || '',
        place: result.venue || '',
        performedAt: result.date && result.time 
          ? `${result.date}T${result.time}:00` 
          : undefined,
      };

      return ocrResult;

    } catch (error) {
      console.error('OCR extraction error:', error);
      return null;
    }
  },

  /**
   * Google Vision API를 사용한 OCR (옵션)
   */
  async extractWithGoogleVision(
    imageUri: string,
    apiKey: string
  ): Promise<ApiResponse<OCRResult>> {
    try {
      const base64Image = await convertImageToBase64(imageUri);

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: 'TEXT_DETECTION',
                    maxResults: 1,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const extractedText =
        data.responses[0]?.fullTextAnnotation?.text || '';

      // 추출된 텍스트를 파싱하여 티켓 정보로 변환
      const parsedResult = parseTicketText(extractedText);

      return {
        success: true,
        data: parsedResult,
      };
    } catch (error) {
      console.error('Google Vision API error:', error);
      return {
        success: false,
        error: {
          code: 'OCR_ERROR',
          message: 'OCR 처리 중 오류가 발생했습니다.',
        },
      };
    }
  },

  /**
   * 온디바이스 OCR (react-native-text-recognition 사용 시)
   */
  async extractWithDeviceOCR(imageUri: string): Promise<ApiResponse<OCRResult>> {
    try {
      // react-native-text-recognition 사용
      // const TextRecognition = require('react-native-text-recognition').default;
      // const result = await TextRecognition.recognize(imageUri);
      // const extractedText = result.map((block: any) => block.text).join('\n');

      // 임시 구현 (실제로는 위 코드 사용)
      const extractedText = '임시 텍스트';
      const parsedResult = parseTicketText(extractedText);

      return {
        success: true,
        data: parsedResult,
      };
    } catch (error) {
      console.error('Device OCR error:', error);
      return {
        success: false,
        error: {
          code: 'OCR_ERROR',
          message: 'OCR 처리 중 오류가 발생했습니다.',
        },
      };
    }
  },
};

/**
 * 이미지를 Base64로 변환하는 헬퍼 함수
 */
async function convertImageToBase64(imageUri: string): Promise<string> {
  // React Native에서 이미지를 Base64로 변환하는 로직
  // 실제 구현은 react-native-fs 등을 사용
  return '';
}

/**
 * 추출된 텍스트를 파싱하여 티켓 정보로 변환하는 헬퍼 함수
 */
function parseTicketText(text: string): OCRResult {
  // 텍스트 파싱 로직 구현
  return {
    title: '',
    place: '',
    performedAt: undefined,
  };
}

export default ocrService;
