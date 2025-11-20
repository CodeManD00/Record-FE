/**
 * 티켓 = 리뷰 기반 서비스 (백엔드 명세 100% 일치)
 * 단, 요청한 기능: 티켓 상세 조회 / 티켓 이미지 업로드는 기존대로 유지
 */

import { apiClient } from './client';
import { Result } from '../../utils/result';
import {
  ReviewCreateRequest,
  ReviewUpdateRequest,
  PageReviewListItemResponse,
  ReviewListItemResponse
} from '../../types/review';

class TicketService {

  /**
   * 1) 내 티켓(=내 리뷰) 목록 조회
   * GET /api/reviews/me/{userId}
   */
  async getMyTickets(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<Result<PageReviewListItemResponse>> {

    return apiClient.get<PageReviewListItemResponse>(
      `/api/reviews/me/${userId}?page=${page}&size=${size}`
    );
  }

  /**
   * 2) 티켓(=리뷰) 생성
   * POST /api/reviews
   */
  async createTicket(data: ReviewCreateRequest):
    Promise<Result<{ reviewId: number; createdAt: string }>> {

    return apiClient.post('/api/reviews', data);
  }

  /**
   * 3) 티켓(=리뷰) 수정
   * PATCH /api/reviews/{reviewId}
   */
  async updateTicket(
    reviewId: number,
    userId: string,
    data: ReviewUpdateRequest
  ): Promise<Result<any>> {

    return apiClient.patch(`/api/reviews/${reviewId}?userId=${userId}`, data);
  }

  /**
   * 4) 티켓(=리뷰) 삭제
   * DELETE /api/reviews/{reviewId}
   */
  async deleteTicket(
    reviewId: number,
    userId: string
  ): Promise<Result<any>> {

    return apiClient.delete(`/api/reviews/${reviewId}?userId=${userId}`);
  }

  /**
   * 5) 친구 티켓(=리뷰) 목록 조회
   * GET /api/reviews/me/{friendId}
   */
  async getFriendTickets(
    friendId: string,
    page: number = 0,
    size: number = 20
  ): Promise<Result<PageReviewListItemResponse>> {

    return apiClient.get<PageReviewListItemResponse>(
      `/api/reviews/me/${friendId}?page=${page}&size=${size}`
    );
  }

  /**
   * ⚠️ 6) 티켓 상세 조회 (원래 기능 그대로 유지)
   *    현재 백엔드 명세에는 단일 리뷰 조회 API가 없음.
   *    따라서 프론트에서 필요하다면 list에서 찾거나
   *    /api/reviews/{id} API를 백엔드에 추가해야 정확함.
   */
  async getTicket(ticketId: string): Promise<Result<any>> {
    return apiClient.get<any>(`/tickets/${ticketId}`);
  }

  /**
   * ⚠️ 7) 티켓 이미지 업로드 (원래 기능 그대로 유지)
   */
  async uploadTicketImages(
    ticketId: string,
    imageUris: string[]
  ): Promise<Result<{ imageUrls: string[] }>> {

    const formData = new FormData();

    imageUris.forEach((imageUri, index) => {
      formData.append('images', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `ticket_image_${index}.jpg`,
      } as any);
    });

    // multipart는 postForm 사용해야 함
    return apiClient.postForm<{ imageUrls: string[] }>(
      `/tickets/${ticketId}/images`,
      formData
    );
  }
}

export const ticketService = new TicketService();
export default ticketService;
