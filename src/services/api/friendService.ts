/**
 * 친구 관련 API 서비스
 * 친구 목록, 요청, 검색 등의 API 호출 함수들
 */

import { apiClient } from './client';
import { Result } from '../../utils/result';
import { Friend, FriendRequest, CreateFriendRequestData, RespondToFriendRequestData } from '../../types/friend';

/**
 * 친구 검색 파라미터
 */
export interface SearchFriendsParams {
  query: string;
  limit?: number;
  offset?: number;
}

/**
 * 친구 검색 결과
 */
export interface SearchFriendsResponse {
  users: Friend[];
  total: number;
  hasMore: boolean;
}

/**
 * 친구 목록 조회 파라미터
 */
export interface GetFriendsParams {
  limit?: number;
  offset?: number;
}

/**
 * 친구 목록 응답
 */
export interface GetFriendsResponse {
  friends: Friend[];
  total: number;
  hasMore: boolean;
}

/**
 * 친구 요청 목록 응답
 */
export interface GetFriendRequestsResponse {
  requests: FriendRequest[];
  total: number;
  hasMore: boolean;
}

/**
 * 친구 서비스 클래스
 */
class FriendService {
  /**
   * 친구 목록 조회
   */
  async getFriends(params?: GetFriendsParams): Promise<Result<GetFriendsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `/friends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<GetFriendsResponse>(url);
  }

  /**
   * 친구 검색
   */
  async searchFriends(params: SearchFriendsParams): Promise<Result<SearchFriendsResponse>> {
    const queryParams = new URLSearchParams({
      query: params.query,
    });
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    return apiClient.get<SearchFriendsResponse>(`/friends/search?${queryParams.toString()}`);
  }

  /**
   * 받은 친구 요청 목록 조회
   */
  async getReceivedFriendRequests(): Promise<Result<GetFriendRequestsResponse>> {
    return apiClient.get<GetFriendRequestsResponse>('/friends/requests/received');
  }

  /**
   * 보낸 친구 요청 목록 조회
   */
  async getSentFriendRequests(): Promise<Result<GetFriendRequestsResponse>> {
    return apiClient.get<GetFriendRequestsResponse>('/friends/requests/sent');
  }

  /**
   * 친구 요청 보내기
   */
  async sendFriendRequest(data: CreateFriendRequestData): Promise<Result<FriendRequest>> {
    return apiClient.post<FriendRequest>('/friends/requests', data);
  }

  /**
   * 친구 요청 응답 (수락/거절)
   */
  async respondToFriendRequest(data: RespondToFriendRequestData): Promise<Result<{ success: boolean; friend?: Friend }>> {
    return apiClient.post<{ success: boolean; friend?: Friend }>(`/friends/requests/${data.requestId}/respond`, {
      accept: data.accept,
    });
  }

  /**
   * 친구 삭제
   */
  async removeFriend(friendId: string): Promise<Result<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/friends/${friendId}`);
  }

  /**
   * 친구 프로필 조회
   */
  async getFriendProfile(friendId: string): Promise<Result<Friend>> {
    return apiClient.get<Friend>(`/friends/${friendId}/profile`);
  }

  /**
   * 친구 요청 취소
   */
  async cancelFriendRequest(requestId: string): Promise<Result<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/friends/requests/${requestId}`);
  }

  /**
   * 친구 차단
   */
  async blockFriend(friendId: string): Promise<Result<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/friends/${friendId}/block`);
  }

  /**
   * 친구 차단 해제
   */
  async unblockFriend(friendId: string): Promise<Result<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/friends/${friendId}/block`);
  }

  /**
   * 친구 뮤트
   */
  async muteFriend(friendId: string): Promise<Result<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/friends/${friendId}/mute`);
  }

  /**
   * 친구 뮤트 해제
   */
  async unmuteFriend(friendId: string): Promise<Result<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`/friends/${friendId}/mute`);
  }
}

// 싱글톤 인스턴스 생성
export const friendService = new FriendService();
export default friendService;
