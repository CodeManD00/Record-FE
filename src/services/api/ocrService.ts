/**
 * OCR API 서비스
 */

const API_BASE_URL = 'http://localhost:8080'; // 로컬 개발용
const USE_MOCK_DATA = true; // 서버 없이 테스트할 때 true로 설정

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
    /*
    // 목 데이터 모드: 서버 없이 테스트용
    if (USE_MOCK_DATA) {
      console.log('🧪 목 데이터 모드로 OCR 실행');
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1500)); // 로딩 시뮬레이션
      
      return {
        title: '2024 밴드 페스티벌',
        artist: '혁오',
        place: '올림픽공원 88잔디마당',
        genre: '밴드',
        bookingSite: '인터파크',
        performedAt: '2024-10-25T19:00:00',
      };
    }
*/
    // 실제 서버 호출
    try {
      // 1. 업로드용 FormData 생성
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'ticket.jpeg',
      } as any);

      // 2. 백엔드 /ocr/extract 엔드포인트 호출
      const response = await fetch(`${API_BASE_URL}/ocr/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      // 3. JSON 응답 파싱
      const data = await response.json();

      // 4. 필요한 필드만 추출해 반환
      return {
        title: data.title || '제목 없음',
        artist: data.artist || '아티스트 미상',
        place: data.venue || '장소 미상',
        performedAt:
          data.date && data.time ? `${data.date}T${data.time}:00` : undefined,
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      return null;
    }
  },
};

export default ocrService;
