import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Progress {
  id: number;
  personId: number;
  progressDate: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  person?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface ProgressFilters {
  personId?: number;
}

export function useProgresses(filters?: ProgressFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.progresses.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/progresses', {
        ...buildPaginationParams(pagination),
        personId: filters?.personId,
      });
      return apiGetList<Progress>(url);
    },
    staleTime: STALE_TIMES.PROGRESSES,
  });
}

export function useProgress(id: number) {
  return useQuery({
    queryKey: queryKeys.progresses.detail(id),
    queryFn: () => apiGet<Progress>(`/api/progresses/${id}`),
    staleTime: STALE_TIMES.PROGRESSES,
    enabled: !!id,
  });
}
