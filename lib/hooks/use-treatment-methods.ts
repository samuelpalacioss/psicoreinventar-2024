import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface TreatmentMethod {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentMethodFilters {
  search?: string;
}

export function useTreatmentMethods(filters?: TreatmentMethodFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.treatmentMethods.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/treatment-methods', {
        ...buildPaginationParams(pagination),
        search: filters?.search,
      });
      return apiGetList<TreatmentMethod>(url);
    },
    staleTime: STALE_TIMES.TREATMENT_METHODS,
  });
}

export function useTreatmentMethod(id: number) {
  return useQuery({
    queryKey: queryKeys.treatmentMethods.detail(id),
    queryFn: () => apiGet<TreatmentMethod>(`/api/treatment-methods/${id}`),
    staleTime: STALE_TIMES.TREATMENT_METHODS,
    enabled: !!id,
  });
}
