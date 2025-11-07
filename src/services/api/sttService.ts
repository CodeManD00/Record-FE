/**
 * STT (Speech-to-Text) API 서비스
 */

import apiClient from './client';
import { Result } from '../../utils/result';

/**
 * STT 응답 타입
 */
export interface TranscriptionResponse {
  id: number | null;
  fileName: string;
  createdAt: string;
  transcript: string;
  summary: string | null;
  questions: string[] | null;
  finalReview: string | null;
}

/**
 * 요약 응답 타입
 */
export interface SummaryResponse {
  id: number | null;
  summary: string;
}

/**
 * STT 서비스
 */
class SttService {
  /**
   * 오디오 파일을 텍스트로 변환 (DB 저장 안 함)
   * @param audioUri - 오디오 파일 URI
   * @param fileName - 파일 이름 (기본값: recording.m4a)
   */
  async transcribeAudio(
    audioUri: string,
    fileName: string = 'recording.m4a'
  ): Promise<Result<TranscriptionResponse>> {
    try {
      const formData = new FormData();
      
      // React Native에서 파일 업로드
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: fileName,
      } as any);

      const response = await fetch(`http://127.0.0.1:8080/stt/transcribe-only`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'STT 변환에 실패했습니다');
      }

      const data = await response.json();
      
      // 백엔드 응답이 직접 TranscriptionResponse 형태로 오는 경우
      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      console.error('STT Error:', error);
      return {
        success: false,
        error: {
          code: 'STT_ERROR',
          message: error.message || 'STT 변환 중 오류가 발생했습니다',
        },
      };
    }
  }

  /**
   * 오디오 파일을 텍스트로 변환하고 DB에 저장
   * @param audioUri - 오디오 파일 URI
   * @param fileName - 파일 이름
   */
  async transcribeAndSave(
    audioUri: string,
    fileName: string = 'recording.m4a'
  ): Promise<Result<TranscriptionResponse>> {
    try {
      const formData = new FormData();
      
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: fileName,
      } as any);

      const response = await fetch(`http://127.0.0.1:8080/stt/transcribe-and-save`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          // Authorization 헤더는 apiClient의 토큰 사용
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'STT 변환 및 저장에 실패했습니다');
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      console.error('STT Save Error:', error);
      return {
        success: false,
        error: {
          code: 'STT_SAVE_ERROR',
          message: error.message || 'STT 변환 및 저장 중 오류가 발생했습니다',
        },
      };
    }
  }

  /**
   * 텍스트 요약 생성
   * @param text - 요약할 텍스트
   * @param transcriptionId - 기존 transcription ID (선택)
   */
  async summarizeText(
    text: string,
    transcriptionId?: number
  ): Promise<Result<SummaryResponse>> {
    return apiClient.post<SummaryResponse>('/reviews/summaries', {
      rawText: text,
      transcriptionId: transcriptionId,
    });
  }

  /**
   * 최종 후기 생성
   * @param transcriptionId - transcription ID
   * @param extraNotes - 추가 메모 (선택)
   */
  async finalizeReview(
    transcriptionId: number,
    extraNotes?: string
  ): Promise<Result<TranscriptionResponse>> {
    return apiClient.post<TranscriptionResponse>('/reviews/final', {
      transcriptionId,
      extraNotes,
    });
  }

  /**
   * 질문-답변 병합하여 최종 후기 생성
   * @param qaList - 질문-답변 리스트
   * @param baseReview - 기존 후기 (선택)
   */
  async mergeAnswers(
    qaList: Array<{ question: string; answer: string }>,
    baseReview?: string
  ): Promise<Result<TranscriptionResponse>> {
    return apiClient.post<TranscriptionResponse>('/stt/merge-answers', {
      qaList,
      baseReview,
    });
  }

  /**
   * Transcription 조회
   * @param id - transcription ID
   */
  async getTranscription(id: number): Promise<Result<TranscriptionResponse>> {
    return apiClient.get<TranscriptionResponse>(`/stt/${id}`);
  }

  /**
   * 사용자의 Transcription 목록 조회
   */
  async listTranscriptions(): Promise<Result<any[]>> {
    return apiClient.get<any[]>('/stt/list');
  }
}

// 싱글톤 인스턴스 생성
export const sttService = new SttService();
export default sttService;
