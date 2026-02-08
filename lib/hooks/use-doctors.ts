import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queries/query-keys';
import { apiGet, apiGetList, buildUrl, buildPaginationParams } from '@/lib/queries/api-client';
import { STALE_TIMES } from '@/lib/queries/stale-times';
import type { PaginationParams } from '@/src/dal/types';
import type { InferSelectModel } from 'drizzle-orm';
import { doctors, places } from '@/src/db/schema';

export type Doctor = InferSelectModel<typeof doctors> & {
  place?: Pick<InferSelectModel<typeof places>, 'id' | 'name'>;
  stats?: {
    averageScore: number;
    totalReviews: number;
  };
  conditions?: string[];
};

export interface DoctorFilters {
  search?: string;
  placeId?: number;
  isActive?: boolean;
  serviceId?: number;
  conditionId?: number;
  languageId?: number;
  treatmentMethodId?: number;
}

export interface DoctorService {
  id: number;
  doctorId: number;
  serviceId: number;
  service?: {
    id: number;
    name: string;
  };
}

export interface DoctorPhone {
  id: number;
  doctorId: number;
  phone: string;
  isPrimary: boolean;
}

export interface DoctorSchedule {
  id: number;
  doctorId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface DoctorCondition {
  id: number;
  doctorId: number;
  conditionId: number;
  condition?: {
    id: number;
    name: string;
  };
}

export interface DoctorLanguage {
  id: number;
  doctorId: number;
  languageId: number;
  language?: {
    id: number;
    name: string;
  };
}

export interface DoctorTreatmentMethod {
  id: number;
  doctorId: number;
  treatmentMethodId: number;
  treatmentMethod?: {
    id: number;
    name: string;
  };
}

export interface DoctorAgeGroup {
  id: number;
  doctorId: number;
  minAge: number | null;
  maxAge: number | null;
}

export interface DoctorEducation {
  id: number;
  doctorId: number;
  institutionId: number;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date | null;
  institution?: {
    id: number;
    name: string;
  };
}

export interface DoctorPayoutMethod {
  id: number;
  doctorId: number;
  type: string;
  details: Record<string, unknown>;
  isPreferred: boolean;
}

export interface DoctorAppointment {
  id: number;
  personId: number;
  doctorId: number;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string | null;
  deletedAt: Date | null;
}

export interface DoctorReview {
  id: number;
  doctorId: number;
  personId: number;
  appointmentId: number | null;
  score: number;
  description: string | null;
  afterSessions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorAppointmentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

// Main doctor queries
export function useDoctors(filters?: DoctorFilters, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.list(filters, pagination),
    queryFn: () => {
      const url = buildUrl('/api/doctors', {
        ...buildPaginationParams(pagination),
        search: filters?.search,
        placeId: filters?.placeId,
        isActive: filters?.isActive,
        serviceId: filters?.serviceId,
        conditionId: filters?.conditionId,
        languageId: filters?.languageId,
        treatmentMethodId: filters?.treatmentMethodId,
      });
      return apiGetList<Doctor>(url);
    },
    staleTime: STALE_TIMES.DOCTORS,
  });
}

export function useDoctor(id: number) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: () => apiGet<Doctor>(`/api/doctors/${id}`),
    staleTime: STALE_TIMES.DOCTOR_PROFILE,
    enabled: !!id,
  });
}

// Sub-resource queries
export function useDoctorServices(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.services(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/services`, buildPaginationParams(pagination));
      return apiGetList<DoctorService>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_SERVICES,
    enabled: !!doctorId,
  });
}

export function useDoctorPhones(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.phones(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/phones`, buildPaginationParams(pagination));
      return apiGetList<DoctorPhone>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_PHONES,
    enabled: !!doctorId,
  });
}

export function useDoctorSchedules(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.schedules(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/schedules`, buildPaginationParams(pagination));
      return apiGetList<DoctorSchedule>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_SCHEDULES,
    enabled: !!doctorId,
  });
}

export function useDoctorConditions(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.conditions(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/conditions`, buildPaginationParams(pagination));
      return apiGetList<DoctorCondition>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_CONDITIONS,
    enabled: !!doctorId,
  });
}

export function useDoctorLanguages(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.languages(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/languages`, buildPaginationParams(pagination));
      return apiGetList<DoctorLanguage>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_LANGUAGES,
    enabled: !!doctorId,
  });
}

export function useDoctorTreatmentMethods(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.treatmentMethods(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/treatment-methods`, buildPaginationParams(pagination));
      return apiGetList<DoctorTreatmentMethod>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_TREATMENT_METHODS,
    enabled: !!doctorId,
  });
}

export function useDoctorAgeGroups(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.ageGroups(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/age-groups`, buildPaginationParams(pagination));
      return apiGetList<DoctorAgeGroup>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_AGE_GROUPS,
    enabled: !!doctorId,
  });
}

export function useDoctorEducations(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.educations(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/educations`, buildPaginationParams(pagination));
      return apiGetList<DoctorEducation>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_EDUCATIONS,
    enabled: !!doctorId,
  });
}

export function useDoctorPayoutMethods(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.payoutMethods(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/payout-methods`, buildPaginationParams(pagination));
      return apiGetList<DoctorPayoutMethod>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_PAYOUT_METHODS,
    enabled: !!doctorId,
  });
}

export function useDoctorAppointments(
  doctorId: number,
  filters?: DoctorAppointmentFilters,
  pagination?: PaginationParams
) {
  return useQuery({
    queryKey: queryKeys.doctors.appointments(doctorId, filters, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/appointments`, {
        ...buildPaginationParams(pagination),
        status: filters?.status,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      });
      return apiGetList<DoctorAppointment>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_APPOINTMENTS,
    enabled: !!doctorId,
  });
}

export function useDoctorReviews(doctorId: number, pagination?: PaginationParams) {
  return useQuery({
    queryKey: queryKeys.doctors.reviews(doctorId, pagination),
    queryFn: () => {
      const url = buildUrl(`/api/doctors/${doctorId}/reviews`, buildPaginationParams(pagination));
      return apiGetList<DoctorReview>(url);
    },
    staleTime: STALE_TIMES.DOCTOR_REVIEWS,
    enabled: !!doctorId,
  });
}
