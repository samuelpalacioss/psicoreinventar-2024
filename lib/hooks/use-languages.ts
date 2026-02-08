import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Language {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LanguageFilters {
  search?: string;
}

export function useLanguages(filters?: LanguageFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.languages.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/languages', {
        ...buildPaginationParams(pagination),
        search: filters?.search,
      });
      return apiGetList<Language>(url);
    },
    staleTime: STALE_TIMES.LANGUAGES,
  });
}

export function useLanguage(id: number) {
  return useQuery({
    queryKey: queryKeys.languages.detail(id),
    queryFn: () => apiGet<Language>(`/api/languages/${id}`),
    staleTime: STALE_TIMES.LANGUAGES,
    enabled: !!id,
  });
}
