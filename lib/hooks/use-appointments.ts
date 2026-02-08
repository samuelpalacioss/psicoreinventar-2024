import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Appointment {
  id: number;
  personId: number;
  doctorId: number;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  person?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  doctor?: {
    id: number;
    person?: {
      firstName: string;
      lastName: string;
    };
    place?: {
      name: string;
      address: string;
    };
  };
}

export interface AppointmentFilters {
  personId?: number;
  doctorId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export function useAppointments(filters?: AppointmentFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.appointments.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/appointments', {
        ...buildPaginationParams(pagination),
        personId: filters?.personId,
        doctorId: filters?.doctorId,
        status: filters?.status,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      });
      return apiGetList<Appointment>(url);
    },
    staleTime: STALE_TIMES.APPOINTMENTS,
  });
}

export function useAppointment(id: number) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: () => apiGet<Appointment>(`/api/appointments/${id}`),
    staleTime: STALE_TIMES.APPOINTMENTS,
    enabled: !!id,
  });
}
