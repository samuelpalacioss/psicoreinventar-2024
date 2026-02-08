import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface User {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFilters {
  search?: string;
  role?: string;
}

export function useUsers(filters?: UserFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.users.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/users', {
        ...buildPaginationParams(pagination),
        search: filters?.search,
        role: filters?.role,
      });
      return apiGetList<User>(url);
    },
    staleTime: STALE_TIMES.USERS,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => apiGet<User>(`/api/users/${id}`),
    staleTime: STALE_TIMES.USERS,
    enabled: !!id,
  });
}
