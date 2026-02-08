import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Payment {
  id: number;
  personId: number;
  appointmentId: number;
  amount: number;
  paymentDate: Date;
  paymentMethodId: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  person?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  appointment?: {
    id: number;
    startTime: Date;
    status: string;
  };
  paymentMethod?: {
    id: number;
    type: string;
  };
}

export interface PaymentFilters {
  personId?: number;
  appointmentId?: number;
  startDate?: string;
  endDate?: string;
}

export function usePayments(filters?: PaymentFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.payments.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/payments', {
        ...buildPaginationParams(pagination),
        personId: filters?.personId,
        appointmentId: filters?.appointmentId,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      });
      return apiGetList<Payment>(url);
    },
    staleTime: STALE_TIMES.PAYMENTS,
  });
}

export function usePayment(id: number) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => apiGet<Payment>(`/api/payments/${id}`),
    staleTime: STALE_TIMES.PAYMENTS,
    enabled: !!id,
  });
}
