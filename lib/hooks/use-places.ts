import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Place {
  id: number;
  osmId: string;
  osmType: string;
  displayName: string;
  displayPlace: string;
  displayAddress: string | null;
  class: string | null;
  type: string;
  city: string | null;
  state: string | null;
  country: string | null;
  postcode: string | null;
  lat: string;
  lon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceFilters {
  search?: string;
  type?: string;
  city?: string;
  state?: string;
  country?: string;
}

export function usePlaces(filters?: PlaceFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.places.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/places', {
        ...buildPaginationParams(pagination),
        search: filters?.search,
        type: filters?.type,
        city: filters?.city,
        state: filters?.state,
        country: filters?.country,
      });
      return apiGetList<Place>(url);
    },
    staleTime: STALE_TIMES.PLACES,
  });
}

export function usePlace(id: number) {
  return useQuery({
    queryKey: queryKeys.places.detail(id),
    queryFn: () => apiGet<Place>(`/api/places/${id}`),
    staleTime: STALE_TIMES.PLACES,
    enabled: !!id,
  });
}
