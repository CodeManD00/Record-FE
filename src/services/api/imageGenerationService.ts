import { ApiResponse } from './client';

const API_BASE_URL = 'http://127.0.0.1:8080'; // 로컬 개발용
const USE_MOCK_DATA = false; // 서버 없이 테스트할 때 true로 설정

/**
 * 이미지 생성 요청 데이터 타입
 * 백엔드의 PromptRequest와 일치해야 함
 */
export interface ImageGenerationRequest {
  title: string;        // 공연 제목
  review: string;       // 후기 텍스트
  genre?: string;       // 장르 (뮤지컬/밴드)
  location?: string;    // 공연 장소 (선택사항)
  date?: string;        // 공연 날짜 (선택사항)
  cast?: string[];      // 출연진 (선택사항)
}

/**
 * 이미지 생성 응답 데이터 타입
 * 백엔드의 ImageResponse와 일치해야 함
 */
export interface ImageGenerationResponse {
  prompt: string;       // 생성된 프롬프트
  imageUrl: string;     // 생성된 이미지 URL
}

export const imageGenerationService = {
  /**
   * AI 이미지 생성 요청
   * @param request 이미지 생성 요청 데이터
   * @returns 생성된 이미지 정보
   */
  async generateImage(request: ImageGenerationRequest): Promise<ApiResponse<ImageGenerationResponse>> {
    // 목 데이터 모드: 서버 없이 테스트용
    if (USE_MOCK_DATA) {
      console.log('🧪 목 데이터 모드로 이미지 생성 실행');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000)); // 로딩 시뮬레이션
      
      return {
        success: true,
        data: {
          prompt: `공연 후기 기반 AI 이미지: ${request.title} - ${request.review.substring(0, 50)}...`,
          imageUrl: 'https://via.placeholder.com/1024x1024/FF6B6B/FFFFFF?text=Generated+Image',
        },
      };
    }

    // 실제 서버 호출
    try {
      // 디버깅: 요청 데이터 확인
      console.log('🔍 이미지 생성 요청 시작 - 요청 데이터:', request);
      
      const response = await fetch(`${API_BASE_URL}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // 디버깅: 응답 상태 확인
      console.log('📡 백엔드 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 백엔드 오류 응답:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ 백엔드 이미지 생성 결과:', result);
      
      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('이미지 생성 오류:', error);
      return {
        success: false,
        error: {
          code: 'IMAGE_GENERATION_ERROR',
          message: '이미지 생성 중 오류가 발생했습니다.',
        },
      };
    }
  },

  /**
   * 테스트용 이미지 생성 (더미 데이터 반환)
   * @param request 이미지 생성 요청 데이터
   * @returns 더미 이미지 정보
   */
  async generateTestImage(request: ImageGenerationRequest): Promise<ApiResponse<ImageGenerationResponse>> {
    try {
      console.log('🧪 테스트 이미지 생성 요청:', request);
      
      const response = await fetch(`${API_BASE_URL}/generate-image/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 테스트 이미지 생성 오류:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ 테스트 이미지 생성 결과:', result);
      
      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('테스트 이미지 생성 오류:', error);
      return {
        success: false,
        error: {
          code: 'TEST_IMAGE_GENERATION_ERROR',
          message: '테스트 이미지 생성 중 오류가 발생했습니다.',
        },
      };
    }
  },
};
