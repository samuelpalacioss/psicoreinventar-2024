import type { PaginationParams } from '@/src/dal/types';

/**
 * API Response Types matching REST API structure
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base fetch wrapper with cookie-based auth and error handling
 */
export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for session auth
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(
      response.status,
      errorData.error?.code || 'UNKNOWN_ERROR',
      errorData.error?.message || 'An unknown error occurred'
    );
  }

  return data;
}

/**
 * Typed GET for single resources
 */
export async function apiGet<T>(url: string): Promise<T> {
  const response = await apiFetch<ApiSuccessResponse<T>>(url);
  return response.data;
}

/**
 * Typed GET for paginated lists
 */
export async function apiGetList<T>(url: string): Promise<ApiListResponse<T>> {
  return apiFetch<ApiListResponse<T>>(url);
}

/**
 * Build URL with query parameters
 */
export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return path;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
}

/**
 * Build pagination query parameters
 */
export function buildPaginationParams(
  pagination?: PaginationParams
): Record<string, number> | undefined {
  if (!pagination) return undefined;

  return {
    page: pagination.page,
    limit: pagination.limit,
  };
}
