/**
 * API 서비스 통합 export
 * 모든 API 서비스를 한 곳에서 관리
 */

export { apiClient } from './client';
export { friendService } from './friendService';
export { ticketService } from './ticketService';
export { userService } from './userService';
export { ocrService } from './ocrService';
export { imageGenerationService } from './imageGenerationService';

// 타입들도 함께 export
export type {
  ApiError,
  ApiResponse,
} from './client';

export type {
  SearchFriendsParams,
  SearchFriendsResponse,
  GetFriendsParams,
  GetFriendsResponse,
  GetFriendRequestsResponse,
} from './friendService';

export type {
  GetTicketsParams,
  GetTicketsResponse,
  CreateTicketData,
  UpdateTicketData,
  GetFriendTicketsParams,
} from './ticketService';

export type {
  UserProfile,
  LoginData,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  AuthResponse,
} from './userService';

export type {
  OCRResult,
} from './ocrService';

export type {
  ImageGenerationRequest,
  ImageGenerationResponse,
} from './imageGenerationService';
