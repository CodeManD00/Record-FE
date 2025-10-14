/**
 * OCR API 서비스
 * 티켓 이미지에서 텍스트를 추출하는 OCR 기능 제공
 */

import { apiClient, ApiResponse } from './client';
import RNFS from 'react-native-fs';

// OCR 결과 타입
export interface OCRResult {
  title?: string;
  artist?: string;
  place?: string;
  performedAt?: string; // ISO 8601 형식
  bookingSite?: string;
  genre?: string;
  rawText?: string; // 원본 추출 텍스트
  confidence?: number; // 신뢰도 (0-1)
}

// OCR 요청 데이터
export interface OCRRequest {
  imageUri: string;
  imageBase64?: string; // Base64 인코딩된 이미지
}

/**
 * OCR 서비스
 */
export const ocrService = {
  /**
   * 티켓 이미지에서 텍스트 추출
   * @param imageUri - 이미지 URI 또는 Base64
   * @returns OCR 결과
   */
  async extractTicketInfo(imageUri: string): Promise<ApiResponse<OCRResult>> {
    try {
      // 이미지를 Base64로 변환 (필요한 경우)
      const base64Image = await convertImageToBase64(imageUri);

      // TODO: 실제 OCR API 엔드포인트로 변경
      // 옵션 1: 자체 서버 API
      const response = await apiClient.post<OCRResult>('/ocr/extract', {
        image: base64Image,
        type: 'ticket',
      });

      return response;

      // 옵션 2: Google Vision API 직접 호출
      // return await callGoogleVisionAPI(base64Image);

      // 옵션 3: AWS Textract
      // return await callAWSTextract(base64Image);
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw error;
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
 * 이미지를 Base64로 변환
 * React Native 환경에서 안정적으로 작동하는 RNFS 사용
 */
async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    // file:// 프로토콜 제거
    let filePath = imageUri;
    if (filePath.startsWith('file://')) {
      filePath = filePath.replace('file://', '');
    }

    // RNFS를 사용하여 Base64로 변환
    const base64String = await RNFS.readFile(filePath, 'base64');
    return base64String;
  } catch (error) {
    console.error('Image conversion error:', error);
    
    // 폴백: fetch 방식 시도
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // "data:image/jpeg;base64," 제거
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (fallbackError) {
      console.error('Fallback conversion error:', fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * 추출된 텍스트를 파싱하여 티켓 정보로 변환
 */
function parseTicketText(text: string): OCRResult {
  const result: OCRResult = {
    rawText: text,
    confidence: 0.8, // 기본 신뢰도
  };

  // 공연 제목 추출
  const titlePatterns = [
    /공연명[:\s]*(.+)/i,
    /제목[:\s]*(.+)/i,
    /title[:\s]*(.+)/i,
  ];
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.title = match[1].trim();
      break;
    }
  }

  // 아티스트 추출
  const artistPatterns = [
    /출연[:\s]*(.+)/i,
    /아티스트[:\s]*(.+)/i,
    /artist[:\s]*(.+)/i,
  ];
  for (const pattern of artistPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.artist = match[1].trim();
      break;
    }
  }

  // 공연장 추출
  const placePatterns = [
    /장소[:\s]*(.+)/i,
    /공연장[:\s]*(.+)/i,
    /venue[:\s]*(.+)/i,
  ];
  for (const pattern of placePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.place = match[1].trim();
      break;
    }
  }

  // 날짜 추출 (YYYY-MM-DD 또는 YYYY.MM.DD 형식)
  const dateMatch = text.match(/(\d{4})[.-](\d{2})[.-](\d{2})/);
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);

  if (dateMatch) {
    const year = dateMatch[1];
    const month = dateMatch[2];
    const day = dateMatch[3];
    const hour = timeMatch ? timeMatch[1].padStart(2, '0') : '19';
    const minute = timeMatch ? timeMatch[2] : '00';

    // ISO 8601 형식으로 변환
    result.performedAt = `${year}-${month}-${day}T${hour}:${minute}:00`;
  }

  // 예매처 추출
  const bookingSitePatterns = [
    /(인터파크|멜론티켓|예스24|티켓링크)/i,
    /예매[:\s]*(.+)/i,
  ];
  for (const pattern of bookingSitePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.bookingSite = match[1].trim();
      break;
    }
  }

  // 장르 추정 (키워드 기반)
  if (text.match(/밴드|락|록|페스티벌|콘서트/i)) {
    result.genre = '밴드';
  } else if (text.match(/뮤지컬|연극|공연/i)) {
    result.genre = '연극/뮤지컬';
  }

  return result;
}

export default ocrService;
