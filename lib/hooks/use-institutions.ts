import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Institution {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstitutionFilters {
  search?: string;
}

export function useInstitutions(filters?: InstitutionFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.institutions.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/institutions', {
        ...buildPaginationParams(pagination),
        search: filters?.search,
      });
      return apiGetList<Institution>(url);
    },
    staleTime: STALE_TIMES.INSTITUTIONS,
  });
}

export function useInstitution(id: number) {
  return useQuery({
    queryKey: queryKeys.institutions.detail(id),
    queryFn: () => apiGet<Institution>(`/api/institutions/${id}`),
    staleTime: STALE_TIMES.INSTITUTIONS,
    enabled: !!id,
  });
}
