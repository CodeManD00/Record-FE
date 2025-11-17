/**
 * API 호출을 위한 기본 설정 및 에러 처리
 */

import { Result, ResultFactory, ErrorFactory } from '../../utils/result';

// API 기본 설정 (React Native용)
// 개발 환경에서는 로컬 백엔드 서버 사용
// iOS 시뮬레이터에서는 127.0.0.1을 사용하는 것이 더 안정적
const API_BASE_URL = __DEV__ 
  ? 'http://127.0.0.1:8080'  // 로컬 개발 서버 (iOS 시뮬레이터 호환)
  : 'https://api.ticketbook.app'; // 프로덕션 API URL
const API_TIMEOUT = 10000; // 10초

/**
 * API 에러 타입
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * HTTP 클라이언트 클래스 (Fetch API 기반)
 */
class ApiClient {
  private authToken: string | null = null;

  constructor() {
  }

  /**
   * 인증 토큰 설정
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * 인증 토큰 제거
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * 기본 헤더 생성
   */
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Fetch 요청 래퍼
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<Result<T>> {
    try {
      const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
      
      // 요청 로깅 (개발 환경에서만)
      if (__DEV__) {
        const method = options.method || 'GET';
        console.log(`API Request: ${method.toUpperCase()} ${fullUrl}`);
      }

      // 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(fullUrl, {
        ...options,
        headers: this.getHeaders(options.headers as Record<string, string>),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 응답 로깅 (개발 환경에서만)
      if (__DEV__) {
        console.log(`API Response: ${response.status} ${fullUrl}`);
      }

      // 응답 본문 확인
      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      // 에러 응답 상세 로깅
      if (__DEV__ && !response.ok) {
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          body: responseText,
        });
      }
      
      // JSON 응답인 경우
      if (contentType && contentType.includes('application/json')) {
        try {
          const data: ApiResponse<T> = JSON.parse(responseText);
          
          if (response.ok && data.success) {
            return ResultFactory.success(data.data as T);
          } else {
            // 백엔드에서 반환한 에러 메시지 사용
            // 500 오류의 경우 trace에서 더 자세한 정보 추출
            if (response.status === 500 && (data as any).trace) {
              const trace = (data as any).trace as string;
              let detailedMessage = data?.message || '서버 오류가 발생했습니다';
              
              // 메일 인증 실패인 경우
              if (trace.includes('MailAuthenticationException') || trace.includes('Authentication failed') || trace.includes('Username and Password not accepted')) {
                detailedMessage = '메일 서비스 인증에 실패했습니다.\n\n백엔드 관리자에게 다음을 확인해달라고 요청해주세요:\n• Gmail 앱 비밀번호 설정\n• MAIL_USERNAME, MAIL_PASSWORD 환경변수 확인\n• 백엔드 서버 재시작';
              }
              
              return this.handleHttpError(response.status, {
                ...data,
                message: detailedMessage,
              });
            }
            
            return this.handleHttpError(response.status, data);
          }
        } catch (e) {
          // JSON 파싱 실패 시 문자열로 처리
          if (response.ok) {
            return ResultFactory.success(responseText as T);
          } else {
            return ResultFactory.failure(ErrorFactory.api('PARSE_ERROR', responseText));
          }
        }
      } else {
        // 문자열 응답인 경우 (AccountRecoveryController 등)
        if (response.ok) {
          return ResultFactory.success(responseText as T);
        } else {
          return ResultFactory.failure(ErrorFactory.api(`HTTP_${response.status}`, responseText));
        }
      }
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  /**
   * GET 요청
   */
  async get<T>(url: string): Promise<Result<T>> {
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST 요청
   */
  async post<T>(url: string, data?: any, options?: { headers?: Record<string, string> }): Promise<Result<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    });
  }

  /**
   * PUT 요청
   */
  async put<T>(url: string, data?: any, options?: { headers?: Record<string, string> }): Promise<Result<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    });
  }

  /**
   * DELETE 요청
   */
  async delete<T>(url: string, data?: any): Promise<Result<T>> {
    return this.request<T>(url, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * HTTP 에러 처리
   */
  private handleHttpError<T>(status: number, data: ApiResponse<T>): Result<T> {
    // 401 에러 시 토큰 제거
    if (status === 401) {
      this.clearAuthToken();
      if (__DEV__) {
        console.warn('🔒 Unauthorized access - token cleared');
      }
    }

    // 백엔드에서 반환한 메시지 우선 사용
    const errorMessage = data?.message || data?.error?.message;

    switch (status) {
      case 400:
        return ResultFactory.failure(ErrorFactory.validation(errorMessage || '잘못된 요청입니다'));
      case 401:
        return ResultFactory.failure(ErrorFactory.unauthorized(errorMessage));
      case 403:
        return ResultFactory.failure(ErrorFactory.forbidden(errorMessage));
      case 404:
        return ResultFactory.failure(ErrorFactory.notFound('리소스', errorMessage));
      case 500:
        return ResultFactory.failure(ErrorFactory.server(errorMessage || '서버 오류가 발생했습니다'));
      default:
        return ResultFactory.failure(ErrorFactory.api(
          `HTTP_${status}`,
          errorMessage || `HTTP ${status} 오류가 발생했습니다`
        ));
    }
  }

  /**
   * 일반 에러 처리
   */
  private handleError(error: any): Result<any> {
    if (__DEV__) {
      console.error('API Error:', error.message || error);
    }

    if (error.name === 'AbortError') {
      return ResultFactory.failure(ErrorFactory.timeout());
    } else if (error.message?.includes('Network')) {
      return ResultFactory.failure(ErrorFactory.network());
    } else {
      return ResultFactory.failure(ErrorFactory.unknown(error.message || '알 수 없는 오류가 발생했습니다'));
    }
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();
export default apiClient;
