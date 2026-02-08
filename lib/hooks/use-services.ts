import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Service {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceFilters {
  search?: string;
}

export function useServices(filters?: ServiceFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.services.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/services', {
        ...buildPaginationParams(pagination),
        search: filters?.search,
      });
      return apiGetList<Service>(url);
    },
    staleTime: STALE_TIMES.SERVICES,
  });
}

export function useService(id: number) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: () => apiGet<Service>(`/api/services/${id}`),
    staleTime: STALE_TIMES.SERVICES,
    enabled: !!id,
  });
}
