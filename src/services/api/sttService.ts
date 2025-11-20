/**
 * STT (Speech-to-Text) API 서비스 — 백엔드 명세서 100% 일치 완전 수정본
 */

import { apiClient } from './client';
import { Result } from '../../utils/result';

/**
 * 백엔드의 TranscriptionResponse 구조 기반 타입
 */
export interface TranscriptionResponse {
  id: number | null;
  fileName: string;
  createdAt: string;
  transcript: string;
  summary: string | null;
  finalReview: string | null;
}

/**
 * STT 서비스 (명세 일치)
 */
class SttService {

  /**
   * 1) Whisper STT 변환 + DB 저장
   * POST /stt/transcribe-and-save
   */
  async transcribeAndSave(
    audioUri: string,
    fileName: string = 'recording.m4a',
    fileType: string = 'audio/m4a'
  ): Promise<Result<TranscriptionResponse>> {

    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: fileType,
      name: fileName,
    } as any);

    console.log('🎤 STT transcribe-and-save 요청 → FormData 생성 완료');

    return apiClient.postForm('/stt/transcribe-and-save', formData);
  }

  /**
   * 2) STT 텍스트 기반 요약
   * POST /review/summarize
   *
   * request body: ReviewRequest {
   *   transcriptionId?: number;
   *   text?: string;
   * }
   */
  async summarizeReview(
    text: string,
    transcriptionId?: number
  ): Promise<Result<TranscriptionResponse>> {

    console.log('📝 후기 요약 요청:', { text, transcriptionId });

    // OpenAI API 호출은 시간이 오래 걸릴 수 있으므로 타임아웃을 60초로 설정
    return apiClient.post(
      '/review/summarize',
      {
        text,
        transcriptionId,
      },
      { timeoutMs: 60000 } // 60초
    );
  }

  /**
   * 3) 후기 조직화 (Organize)
   * POST /review/organize
   *
   * request: ReviewRequest 같은 구조
   */
  async organizeReview(
    text: string,
    transcriptionId?: number
  ): Promise<Result<TranscriptionResponse>> {

    // OpenAI API 호출은 시간이 오래 걸릴 수 있으므로 타임아웃을 60초로 설정
    return apiClient.post(
      '/review/organize',
      {
        text,
        transcriptionId,
      },
      { timeoutMs: 60000 } // 60초
    );
  }

  /**
   * 4) 후기 finalize (최종본 확정)
   * POST /reviews/finalize
   */
  async finalizeReview(
    transcriptionId: number,
    extraNotes?: string
  ): Promise<Result<TranscriptionResponse>> {

    return apiClient.post('/reviews/finalize', {
      transcriptionId,
      extraNotes,
    });
  }
}

export const sttService = new SttService();
export default sttService;
