/**
 * 친구 관련 상태 관리 Atoms
 * 
 * @description 현업 수준의 안정적이고 확장 가능한 친구 및 친구 관계 데이터 관리
 * @features
 * - Map 기반 구조로 O(1) 성능 최적화
 * - 완전한 타입 안전성 보장
 * - Result 패턴으로 에러 처리 표준화
 * - ISO string 사용으로 직렬화 문제 방지
 * - 단일 객체 파라미터로 API 일관성 확보
 * - 동적 사용자 ID 조회로 하드코딩 제거
 * 
 * @author TicketBookApp Team
 * @version 2.0.0
 * @since 2025-09-15
 */
import { atom } from 'jotai';
import { Friend, FriendRequest, Friendship, FriendTicketsMap, FriendTicketsData, FriendSearchResult, CreateFriendRequestData, RespondToFriendRequestData, UpdateFriendTicketsParams, RemoveFriendParams } from '../types/friend';
import { Ticket } from '../types/ticket';
import { FriendRequestStatus, TicketStatus, CONSTANTS } from '../types/enums';
import { Result, ErrorFactory, ResultFactory } from '../types/errors';
import { userProfileAtom } from './userAtoms';
import { IdGenerator } from '../utils/idGenerator';
import { FriendValidator } from '../utils/validation';

// ============= 기본 상태 Atoms =============
// 모든 기본 상태는 Map 구조를 사용하여 성능과 일관성을 보장합니다.

/**
 * 친구 목록을 Map으로 관리 (성능 최적화)
 * key: friendId, value: Friend
 */
export const friendsMapAtom = atom<Map<string, Friend>>(new Map([
  ['friend_1', {
    id: 'friend_1',
    name: '구름이',
    username: '9RMMY',
    profileImage: 'https://via.placeholder.com/50/20B2AA/FFFFFF?text=서',
    avatar: 'https://via.placeholder.com/50/20B2AA/FFFFFF?text=서',
    createdAt: new Date('2025-08-01T10:00:00'),
    updatedAt: new Date('2025-08-01T10:00:00'),
  }],
  ['friend_2', {
    id: 'friend_2',
    name: '먹구름이',
    username: 'M9RM',
    profileImage: 'https://via.placeholder.com/50/8B4513/FFFFFF?text=민',
    avatar: 'https://via.placeholder.com/50/8B4513/FFFFFF?text=민',
    createdAt: new Date('2025-08-02T10:00:00'),
    updatedAt: new Date('2025-08-02T10:00:00'),
  }],
  ['friend_3', {
    id: 'friend_3',
    name: '뭉게구름이',
    username: 'MUNG9',
    profileImage: 'https://via.placeholder.com/50/708090/FFFFFF?text=이',
    avatar: 'https://via.placeholder.com/50/708090/FFFFFF?text=이',
    createdAt: new Date('2025-08-03T10:00:00'),
    updatedAt: new Date('2025-08-03T10:00:00'),
  }],
]));

/**
 * 친구 요청 목록을 Map으로 관리
 * key: requestId, value: FriendRequest
 */
export const friendRequestsMapAtom = atom<Map<string, FriendRequest>>(new Map([
  ['request_1', {
    id: 'request_1',
    fromUserId: 'user_101',
    toUserId: 'current_user',
    name: '김민수',
    username: 'minsu_kim',
    avatar: 'https://via.placeholder.com/50/4A90E2/FFFFFF?text=김',
    status: FriendRequestStatus.PENDING,
    message: '안녕하세요! 같이 공연 보러 가요!',
    createdAt: new Date('2025-09-18T14:30:00'),
    updatedAt: new Date('2025-09-18T14:30:00'),
  }],
  ['request_2', {
    id: 'request_2',
    fromUserId: 'user_102',
    toUserId: 'current_user',
    name: '박지영',
    username: 'jiyoung_park',
    avatar: 'https://via.placeholder.com/50/E91E63/FFFFFF?text=박',
    status: FriendRequestStatus.PENDING,
    message: '뮤지컬 좋아하시나요? 친구해요!',
    createdAt: new Date('2025-09-17T16:45:00'),
    updatedAt: new Date('2025-09-17T16:45:00'),
  }],
  ['request_3', {
    id: 'request_3',
    fromUserId: 'user_103',
    toUserId: 'current_user',
    name: '이준호',
    username: 'junho_lee',
    avatar: 'https://via.placeholder.com/50/FF9500/FFFFFF?text=이',
    status: FriendRequestStatus.PENDING,
    message: '콘서트 정보 공유해요!',
    createdAt: new Date('2025-09-16T09:20:00'),
    updatedAt: new Date('2025-09-16T09:20:00'),
  }],
  ['request_4', {
    id: 'request_4',
    fromUserId: 'user_104',
    toUserId: 'current_user',
    name: '최수진',
    username: 'sujin_choi',
    avatar: 'https://via.placeholder.com/50/9C27B0/FFFFFF?text=최',
    status: FriendRequestStatus.PENDING,
    message: '티켓북 앱에서 만나서 반가워요!',
    createdAt: new Date('2025-09-15T11:10:00'),
    updatedAt: new Date('2025-09-15T11:10:00'),
  }],
  ['request_5', {
    id: 'request_5',
    fromUserId: 'user_105',
    toUserId: 'current_user',
    name: '정다은',
    username: 'daeun_jung',
    avatar: 'https://via.placeholder.com/50/4CAF50/FFFFFF?text=정',
    status: FriendRequestStatus.PENDING,
    message: '같은 공연 좋아하는 것 같아요! 친구 신청드려요 😊',
    createdAt: new Date('2025-09-14T20:15:00'),
    updatedAt: new Date('2025-09-14T20:15:00'),
  }],
]));

/**
 * 친구 관계 목록을 Map으로 관리
 * key: friendshipId, value: Friendship
 */
export const friendshipsMapAtom = atom<Map<string, Friendship>>(new Map());

/**
 * 친구별 티켓 데이터를 Map으로 관리 (캐시)
 * key: friendId, value: FriendTicketsData
 * ISO string 사용으로 직렬화 문제 방지
 */
export const friendTicketsMapAtom = atom<FriendTicketsMap>(new Map([
  ['friend_1', {
    tickets: [
      {
        id: 'friend1-ticket1',
        title: '콘서트 - 인디 밴드 라이브',
        performedAt: new Date('2025-09-10T19:00:00'),
        status: TicketStatus.PUBLIC,
        place: '홍대 롤링홀',
        artist: '라쿠나',
        userId: 'friend_1',
        createdAt: new Date('2025-08-01T10:00:00'),
        updatedAt: new Date('2025-08-01T10:00:00'),
      },
      {
        id: 'friend1-ticket2',
        title: '뮤지컬 - 캣츠',
        performedAt: new Date('2025-09-12T14:00:00'),
        status: TicketStatus.PUBLIC,
        place: '블루스퀘어 인터파크홀',
        artist: '뮤지컬 배우들',
        userId: 'friend_1',
        createdAt: new Date('2025-08-05T10:00:00'),
        updatedAt: new Date('2025-08-05T10:00:00'),
      },
    ],
    lastUpdated: new Date().toISOString(),
  }],
  ['friend_2', {
    tickets: [
      {
        id: 'friend2-ticket1',
        title: '오페라 - 라 보엠',
        performedAt: new Date('2025-09-18T19:30:00'),
        status: TicketStatus.PUBLIC,
        place: '예술의전당 오페라극장',
        artist: '친구와 함께',
        userId: 'friend_2',
        createdAt: new Date('2025-08-10T10:00:00'),
        updatedAt: new Date('2025-08-10T10:00:00'),
      },
    ],
    lastUpdated: new Date().toISOString(),
  }],
  ['friend_3', {
    tickets: [],
    lastUpdated: new Date().toISOString(),
  }],
]));

// ============= 파생 Atoms (읽기 전용) =============
// 기본 상태로부터 계산되는 읽기 전용 atoms입니다.
// 컴포넌트 호환성과 성능 최적화를 위해 제공됩니다.

/**
 * 친구 목록을 배열로 변환 (기존 컴포넌트 호환성)
 */
export const friendsAtom = atom<Friend[]>((get) => {
  const friendsMap = get(friendsMapAtom);
  return Array.from(friendsMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name, 'ko')
  );
});

/**
 * 친구 총 개수
 */
export const friendsCountAtom = atom<number>((get) => {
  return get(friendsMapAtom).size;
});

/**
 * 받은 친구 요청 목록 (대기 중)
 */
export const receivedFriendRequestsAtom = atom<FriendRequest[]>((get) => {
  const requestsMap = get(friendRequestsMapAtom);
  return Array.from(requestsMap.values())
    .filter(request => request.status === FriendRequestStatus.PENDING)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});

/**
 * 보낸 친구 요청 목록 (대기 중)
 */
export const sentFriendRequestsAtom = atom<FriendRequest[]>((get) => {
  const requestsMap = get(friendRequestsMapAtom);
  return Array.from(requestsMap.values())
    .filter(request => request.status === FriendRequestStatus.PENDING)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
});

/**
 * 특정 친구 조회
 */
export const getFriendByIdAtom = atom<(id: string) => Friend | undefined>((get) => {
  const friendsMap = get(friendsMapAtom);
  return (id: string) => friendsMap.get(id);
});

/**
 * 특정 친구의 티켓 목록 조회 (Map.get 사용)
 */
export const getFriendTicketsAtom = atom<(friendId: string) => Ticket[]>((get) => {
  const friendTicketsMap = get(friendTicketsMapAtom);
  return (friendId: string) => friendTicketsMap.get(friendId)?.tickets || [];
});

/**
 * 친구별 티켓 데이터 (기존 호환성, Map.entries 사용)
 */
export const friendTicketsAtom = atom<Array<{ friendId: string; tickets: Ticket[] }>>((get) => {
  const friendTicketsMap = get(friendTicketsMapAtom);
  return Array.from(friendTicketsMap.entries()).map(([friendId, data]) => ({
    friendId,
    tickets: data.tickets,
  }));
});

// ============= 쓰기 Atoms (액션) =============
// 모든 쓰기 atoms는 단일 객체 파라미터를 받고 Result 패턴을 반환합니다.
// 에러 처리가 표준화되어 있으며 타입 안전성이 보장됩니다.

/**
 * 친구 요청 보내기
 */
export const sendFriendRequestAtom = atom(
  null,
  (get, set, requestData: CreateFriendRequestData): Result<FriendRequest> => {
    try {
      // 유효성 검증
      const friendIdError = FriendValidator.validateFriendId(requestData.toUserId);
      if (friendIdError) return ResultFactory.failure(friendIdError);

      // 이미 친구인지 확인
      const friendsMap = get(friendsMapAtom);
      if (friendsMap.has(requestData.toUserId)) {
        return ResultFactory.failure(
          ErrorFactory.validation('이미 친구로 등록된 사용자입니다')
        );
      }

      // 이미 요청을 보냈는지 확인
      const requestsMap = get(friendRequestsMapAtom);
      const existingRequest = Array.from(requestsMap.values())
        .find(req => req.toUserId === requestData.toUserId && req.status === FriendRequestStatus.PENDING);
      
      if (existingRequest) {
        return ResultFactory.failure(
          ErrorFactory.validation('이미 친구 요청을 보낸 사용자입니다')
        );
      }

      // 새 친구 요청 생성
      const newRequest: FriendRequest = {
        id: IdGenerator.friendRequest(),
        fromUserId: get(userProfileAtom).id,
        toUserId: requestData.toUserId,
        name: requestData.name || 'Unknown User',
        username: requestData.username || '@unknown',
        status: FriendRequestStatus.PENDING,
        message: requestData.message,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Map에 추가
      const newRequestsMap = new Map(requestsMap);
      newRequestsMap.set(newRequest.id, newRequest);
      set(friendRequestsMapAtom, newRequestsMap);

      return ResultFactory.success(newRequest);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.unknown(error instanceof Error ? error.message : '친구 요청 전송 중 오류가 발생했습니다')
      );
    }
  }
);

/**
 * 친구 요청 응답 (수락/거절)
 */
export const respondToFriendRequestAtom = atom(
  null,
  (get, set, responseData: RespondToFriendRequestData): Result<boolean> => {
    try {
      const requestsMap = get(friendRequestsMapAtom);
      const request = requestsMap.get(responseData.requestId);
      
      if (!request) {
        return ResultFactory.failure(ErrorFactory.notFound('친구 요청', responseData.requestId));
      }

      if (request.status !== FriendRequestStatus.PENDING) {
        return ResultFactory.failure(
          ErrorFactory.validation('이미 처리된 친구 요청입니다')
        );
      }

      // 요청 상태 업데이트
      const updatedRequest: FriendRequest = {
        ...request,
        status: responseData.accept ? FriendRequestStatus.ACCEPTED : FriendRequestStatus.REJECTED,
        updatedAt: new Date(),
      };

      const newRequestsMap = new Map(requestsMap);
      newRequestsMap.set(request.id, updatedRequest);
      set(friendRequestsMapAtom, newRequestsMap);

      // 수락한 경우 친구 목록에 추가
      if (responseData.accept) {
        const friendsMap = get(friendsMapAtom);
        const friendshipsMap = get(friendshipsMapAtom);
        
        // 새 친구 추가 (FriendRequest의 실제 정보 사용)
        const newFriend: Friend = {
          id: request.fromUserId,
          name: request.name,
          username: request.username,
          avatar: request.avatar,
          profileImage: request.avatar, // avatar와 profileImage 동기화
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const newFriendsMap = new Map(friendsMap);
        newFriendsMap.set(newFriend.id, newFriend);
        set(friendsMapAtom, newFriendsMap);

        // 새 친구 관계 추가 (현재 사용자 ID 동적 조회)
        const currentUser = get(userProfileAtom);
        const newFriendship: Friendship = {
          id: IdGenerator.friend(),
          userId: currentUser.id,
          friendId: request.fromUserId,
          createdAt: new Date(),
          isBlocked: false,
          isMuted: false,
        };

        const newFriendshipsMap = new Map(friendshipsMap);
        newFriendshipsMap.set(newFriendship.id, newFriendship);
        set(friendshipsMapAtom, newFriendshipsMap);
      }

      return ResultFactory.success(true);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.unknown(error instanceof Error ? error.message : '친구 요청 응답 중 오류가 발생했습니다')
      );
    }
  }
);

/**
 * 친구 삭제 (표준화된 객체 파라미터 사용)
 */
export const removeFriendAtom = atom(
  null,
  (get, set, params: RemoveFriendParams): Result<boolean> => {
    const { friendId } = params;
    try {
      const friendsMap = get(friendsMapAtom);
      const friendshipsMap = get(friendshipsMapAtom);
      
      if (!friendsMap.has(friendId)) {
        return ResultFactory.failure(ErrorFactory.notFound('친구', friendId));
      }

      // 친구 목록에서 제거
      const newFriendsMap = new Map(friendsMap);
      newFriendsMap.delete(friendId);
      set(friendsMapAtom, newFriendsMap);

      // 친구 관계에서 제거
      const friendshipToRemove = Array.from(friendshipsMap.values())
        .find(friendship => friendship.friendId === friendId);
      
      if (friendshipToRemove) {
        const newFriendshipsMap = new Map(friendshipsMap);
        newFriendshipsMap.delete(friendshipToRemove.id);
        set(friendshipsMapAtom, newFriendshipsMap);
      }

      // 친구 티켓 캐시에서 제거 (Map.delete 사용)
      const friendTicketsMap = get(friendTicketsMapAtom);
      const newFriendTicketsMap = new Map(friendTicketsMap);
      newFriendTicketsMap.delete(friendId);
      set(friendTicketsMapAtom, newFriendTicketsMap);

      return ResultFactory.success(true);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.unknown(error instanceof Error ? error.message : '친구 삭제 중 오류가 발생했습니다')
      );
    }
  }
);

/**
 * 친구 티켓 데이터 업데이트 (표준화된 객체 파라미터 및 Map 사용)
 * ISO string으로 직렬화 문제 방지
 */
export const updateFriendTicketsAtom = atom(
  null,
  (get, set, params: UpdateFriendTicketsParams): Result<boolean> => {
    try {
      const { friendId, tickets } = params;
      const friendTicketsMap = get(friendTicketsMapAtom);
      const newFriendTicketsMap = new Map(friendTicketsMap);
      
      newFriendTicketsMap.set(friendId, {
        tickets: [...tickets],
        lastUpdated: new Date().toISOString(),
      });
      
      set(friendTicketsMapAtom, newFriendTicketsMap);
      return ResultFactory.success(true);
    } catch (error) {
      return ResultFactory.failure(
        ErrorFactory.unknown(error instanceof Error ? error.message : '친구 티켓 데이터 업데이트 중 오류가 발생했습니다')
      );
    }
  }
);

// ============= 유틸리티 Atoms =============
// 검색, 통계 등의 유틸리티 기능을 제공하는 atoms입니다.

/**
 * 친구 검색
 */
export const searchFriendsAtom = atom<(query: string) => Friend[]>((get) => {
  const friends = get(friendsAtom);
  return (query: string) => {
    if (!query.trim()) return friends;
    
    const searchLower = query.toLowerCase();
    return friends.filter(friend => 
      friend.name.toLowerCase().includes(searchLower) ||
      friend.username.toLowerCase().includes(searchLower)
    );
  };
});

/**
 * 친구 통계 정보 (Map.values 사용으로 개선)
 */
export const friendStatsAtom = atom((get) => {
  const friendsCount = get(friendsCountAtom);
  const receivedRequests = get(receivedFriendRequestsAtom);
  const sentRequests = get(sentFriendRequestsAtom);
  const friendTicketsMap = get(friendTicketsMapAtom);
  
  const friendsWithTickets = Array.from(friendTicketsMap.values())
    .filter(data => data.tickets.length > 0).length;
  
  return {
    totalFriends: friendsCount,
    pendingReceivedRequests: receivedRequests.length,
    pendingSentRequests: sentRequests.length,
    friendsWithTickets,
  };
});
