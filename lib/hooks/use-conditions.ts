import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Condition {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConditionFilters {
  search?: string;
}

export function useConditions(filters?: ConditionFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.conditions.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/conditions', {
        ...buildPaginationParams(pagination),
        search: filters?.search,
      });
      return apiGetList<Condition>(url);
    },
    staleTime: STALE_TIMES.CONDITIONS,
  });
}

export function useCondition(id: number) {
  return useQuery({
    queryKey: queryKeys.conditions.detail(id),
    queryFn: () => apiGet<Condition>(`/api/conditions/${id}`),
    staleTime: STALE_TIMES.CONDITIONS,
    enabled: !!id,
  });
}
