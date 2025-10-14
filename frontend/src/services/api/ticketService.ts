/**
 * 티켓 관련 API 서비스
 * 티켓 CRUD, 검색, 필터링 등의 API 호출 함수들
 */

import { apiClient } from './client';
import { Result } from '../../utils/result';
import { Ticket, TicketStatus } from '../../types/ticket';

/**
 * 티켓 목록 조회 파라미터
 */
export interface GetTicketsParams {
  limit?: number;
  offset?: number;
  status?: TicketStatus;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  search?: string;
}

/**
 * 티켓 목록 응답
 */
export interface GetTicketsResponse {
  tickets: Ticket[];
  total: number;
  hasMore: boolean;
}

/**
 * 티켓 생성 데이터
 */
export interface CreateTicketData {
  title: string;
  performedAt: string; // ISO string
  place: string;
  artist: string;
  bookingSite?: string;
  status: TicketStatus;
  review?: {
    reviewText: string;
    rating: number;
  };
  images?: string[];
}

/**
 * 티켓 업데이트 데이터
 */
export interface UpdateTicketData extends Partial<CreateTicketData> {
  id: string;
}

/**
 * 친구 티켓 조회 파라미터
 */
export interface GetFriendTicketsParams {
  friendId: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * 티켓 서비스 클래스
 */
class TicketService {
  /**
   * 내 티켓 목록 조회
   */
  async getMyTickets(params?: GetTicketsParams): Promise<Result<GetTicketsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);

    const url = `/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<GetTicketsResponse>(url);
  }

  /**
   * 티켓 상세 조회
   */
  async getTicket(ticketId: string): Promise<Result<Ticket>> {
    return apiClient.get<Ticket>(`/tickets/${ticketId}`);
  }

  /**
   * 티켓 생성
   */
  async createTicket(data: CreateTicketData): Promise<Result<Ticket>> {
    return apiClient.post<Ticket>('/tickets', data);
  }

  /**
   * 티켓 수정
   */
  async updateTicket(data: UpdateTicketData): Promise<Result<Ticket>> {
    const { id, ...updateData } = data;
    return apiClient.put<Ticket>(`/tickets/${id}`, updateData);
  }

  /**
   * 티켓 삭제
   */
  async deleteTicket(ticketId: string): Promise<Result<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/tickets/${ticketId}`);
  }

  /**
   * 친구 티켓 목록 조회
   */
  async getFriendTickets(params: GetFriendTicketsParams): Promise<Result<GetTicketsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const url = `/friends/${params.friendId}/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<GetTicketsResponse>(url);
  }

  /**
   * 티켓 공개 상태 변경
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Result<Ticket>> {
    return apiClient.put<Ticket>(`/tickets/${ticketId}/status`, { status });
  }

  /**
   * 티켓 이미지 업로드
   */
  async uploadTicketImages(ticketId: string, imageUris: string[]): Promise<Result<{ imageUrls: string[] }>> {
    const formData = new FormData();
    
    imageUris.forEach((imageUri, index) => {
      formData.append('images', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `ticket_image_${index}.jpg`,
      } as any);
    });

    return apiClient.post<{ imageUrls: string[] }>(`/tickets/${ticketId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * 티켓 통계 조회
   */
  async getTicketStats(): Promise<Result<{
    totalTickets: number;
    publicTickets: number;
    privateTickets: number;
    thisMonthTickets: number;
    thisYearTickets: number;
  }>> {
    return apiClient.get('/tickets/stats');
  }

  /**
   * 최근 티켓 조회
   */
  async getRecentTickets(limit: number = 10): Promise<Result<Ticket[]>> {
    return apiClient.get<Ticket[]>(`/tickets/recent?limit=${limit}`);
  }

  /**
   * 날짜별 티켓 조회
   */
  async getTicketsByDate(date: string): Promise<Result<Ticket[]>> {
    return apiClient.get<Ticket[]>(`/tickets/by-date?date=${date}`);
  }

  /**
   * 티켓 검색
   */
  async searchTickets(query: string, params?: {
    limit?: number;
    offset?: number;
    status?: TicketStatus;
  }): Promise<Result<GetTicketsResponse>> {
    const queryParams = new URLSearchParams({ search: query });
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.status) queryParams.append('status', params.status);

    return apiClient.get<GetTicketsResponse>(`/tickets/search?${queryParams.toString()}`);
  }
}

// 싱글톤 인스턴스 생성
export const ticketService = new TicketService();
export default ticketService;
