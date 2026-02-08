import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Review {
  id: number;
  doctorId: number;
  personId: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  doctor?: {
    id: number;
    person?: {
      firstName: string;
      lastName: string;
    };
  };
  person?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface ReviewFilters {
  doctorId?: number;
}

export function useReviews(filters?: ReviewFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.reviews.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/reviews', {
        ...buildPaginationParams(pagination),
        doctorId: filters?.doctorId,
      });
      return apiGetList<Review>(url);
    },
    staleTime: STALE_TIMES.REVIEWS,
  });
}

export function useReview(id: number) {
  return useQuery({
    queryKey: queryKeys.reviews.detail(id),
    queryFn: () => apiGet<Review>(`/api/reviews/${id}`),
    staleTime: STALE_TIMES.REVIEWS,
    enabled: !!id,
  });
}
