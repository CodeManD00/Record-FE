/**
 * HTTP 클라이언트 설정 (React Native Fetch API 기반)
 * API 호출을 위한 기본 설정 및 에러 처리
 */

import { Result, ResultFactory, ErrorFactory } from '../../utils/result';

// API 기본 설정 (React Native용)
const API_BASE_URL = 'https://api.ticketbook.app'; // 실제 API URL로 변경 필요
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
    // Fetch API는 별도 초기화가 필요하지 않음
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
        console.log(`🚀 API Request: ${method.toUpperCase()} ${fullUrl}`);
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
        console.log(`✅ API Response: ${response.status} ${fullUrl}`);
      }

      const data: ApiResponse<T> = await response.json();

      if (response.ok && data.success) {
        return ResultFactory.success(data.data as T);
      } else {
        return this.handleHttpError(response.status, data);
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

    switch (status) {
      case 400:
        return ResultFactory.failure(ErrorFactory.validation(data?.message || '잘못된 요청입니다'));
      case 401:
        return ResultFactory.failure(ErrorFactory.unauthorized());
      case 403:
        return ResultFactory.failure(ErrorFactory.forbidden());
      case 404:
        return ResultFactory.failure(ErrorFactory.notFound('리소스'));
      case 500:
        return ResultFactory.failure(ErrorFactory.server());
      default:
        return ResultFactory.failure(ErrorFactory.api(
          `HTTP_${status}`,
          data?.message || `HTTP ${status} 오류가 발생했습니다`
        ));
    }
  }

  /**
   * 일반 에러 처리
   */
  private handleError(error: any): Result<any> {
    if (__DEV__) {
      console.error('❌ API Error:', error.message || error);
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
