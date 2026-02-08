import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: Date;
  gender: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonFilters {
  search?: string;
}

export interface PersonPhone {
  id: number;
  personId: number;
  phone: string;
  isPrimary: boolean;
}

export interface PersonPaymentMethod {
  id: number;
  personId: number;
  type: string;
  details: Record<string, unknown>;
  isPreferred: boolean;
}

export interface PersonAppointment {
  id: number;
  personId: number;
  doctorId: number;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string | null;
  deletedAt: Date | null;
  doctor?: {
    id: number;
    person?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface PersonPayment {
  id: number;
  personId: number;
  appointmentId: number;
  amount: number;
  paymentDate: Date;
  paymentMethodId: number | null;
  notes: string | null;
}

export interface PersonProgress {
  id: number;
  personId: number;
  progressDate: Date;
  notes: string;
  createdAt: Date;
}

export interface PersonAppointmentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Main person queries
export function usePersons(filters?: PersonFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.persons.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/persons', {
        ...buildPaginationParams(pagination),
        search: filters?.search,
      });
      return apiGetList<Person>(url);
    },
    staleTime: STALE_TIMES.PERSONS,
  });
}

export function usePerson(id: number) {
  return useQuery({
    queryKey: queryKeys.persons.detail(id),
    queryFn: () => apiGet<Person>(`/api/persons/${id}`),
    staleTime: STALE_TIMES.PERSON_PROFILE,
    enabled: !!id,
  });
}

// Sub-resource queries
export function usePersonPhones(personId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.persons.phones(personId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/persons/${personId}/phones`, buildPaginationParams(pagination));
      return apiGetList<PersonPhone>(url);
    },
    staleTime: STALE_TIMES.PERSON_PHONES,
    enabled: !!personId,
  });
}

export function usePersonPaymentMethods(personId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.persons.paymentMethods(personId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/persons/${personId}/payment-methods`, buildPaginationParams(pagination));
      return apiGetList<PersonPaymentMethod>(url);
    },
    staleTime: STALE_TIMES.PAYMENT_METHODS,
    enabled: !!personId,
  });
}

export function usePersonAppointments(
  personId: number,
  filters?: PersonAppointmentFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: queryKeys.persons.appointments(personId, filters, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/persons/${personId}/appointments`, {
        ...buildPaginationParams(pagination),
        status: filters?.status,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      });
      return apiGetList<PersonAppointment>(url);
    },
    staleTime: STALE_TIMES.PERSON_APPOINTMENTS,
    enabled: !!personId,
  });
}

export function usePersonPayments(personId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.persons.payments(personId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/persons/${personId}/payments`, buildPaginationParams(pagination));
      return apiGetList<PersonPayment>(url);
    },
    staleTime: STALE_TIMES.PERSON_PAYMENTS,
    enabled: !!personId,
  });
}

export function usePersonProgresses(personId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.persons.progresses(personId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/persons/${personId}/progresses`, buildPaginationParams(pagination));
      return apiGetList<PersonProgress>(url);
    },
    staleTime: STALE_TIMES.PROGRESSES,
    enabled: !!personId,
  });
}
