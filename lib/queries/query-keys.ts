import type { PaginationParams } from '@/src/dal/types';

/**
 * Hierarchical query key factory for all entities
 *
 * Structure:
 * - Level 1: Entity name
 * - Level 2: Query type ('list', 'detail', sub-resource name)
 * - Level 3+: Parameters (filters, pagination, IDs)
 */
export const queryKeys = {
  // Languages
  languages: {
    all: ['languages'] as const,
    lists: () => [...queryKeys.languages.all, 'list'] as const,
    list: (filters?: { search?: string }, pagination?: PaginationParams) =>
      [...queryKeys.languages.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.languages.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.languages.details(), id] as const,
  },

  // Conditions
  conditions: {
    all: ['conditions'] as const,
    lists: () => [...queryKeys.conditions.all, 'list'] as const,
    list: (filters?: { search?: string }, pagination?: PaginationParams) =>
      [...queryKeys.conditions.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.conditions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.conditions.details(), id] as const,
  },

  // Services
  services: {
    all: ['services'] as const,
    lists: () => [...queryKeys.services.all, 'list'] as const,
    list: (filters?: { search?: string }, pagination?: PaginationParams) =>
      [...queryKeys.services.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.services.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.services.details(), id] as const,
  },

  // Treatment Methods
  treatmentMethods: {
    all: ['treatmentMethods'] as const,
    lists: () => [...queryKeys.treatmentMethods.all, 'list'] as const,
    list: (filters?: { search?: string }, pagination?: PaginationParams) =>
      [...queryKeys.treatmentMethods.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.treatmentMethods.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.treatmentMethods.details(), id] as const,
  },

  // Places
  places: {
    all: ['places'] as const,
    lists: () => [...queryKeys.places.all, 'list'] as const,
    list: (filters?: { search?: string }, pagination?: PaginationParams) =>
      [...queryKeys.places.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.places.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.places.details(), id] as const,
  },

  // Institutions
  institutions: {
    all: ['institutions'] as const,
    lists: () => [...queryKeys.institutions.all, 'list'] as const,
    list: (filters?: { search?: string }, pagination?: PaginationParams) =>
      [...queryKeys.institutions.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.institutions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.institutions.details(), id] as const,
  },

  // Doctors (complex entity with 11 sub-resources)
  doctors: {
    all: ['doctors'] as const,
    lists: () => [...queryKeys.doctors.all, 'list'] as const,
    list: (
      filters?: {
        search?: string;
        placeId?: number;
        isActive?: boolean;
        serviceId?: number;
        conditionId?: number;
        languageId?: number;
        treatmentMethodId?: number;
      },
      pagination?: PaginationParams
    ) => [...queryKeys.doctors.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.doctors.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.doctors.details(), id] as const,

    // Sub-resources
    services: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'services', doctorId, pagination] as const,
    phones: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'phones', doctorId, pagination] as const,
    schedules: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'schedules', doctorId, pagination] as const,
    conditions: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'conditions', doctorId, pagination] as const,
    languages: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'languages', doctorId, pagination] as const,
    treatmentMethods: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'treatmentMethods', doctorId, pagination] as const,
    ageGroups: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'ageGroups', doctorId, pagination] as const,
    educations: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'educations', doctorId, pagination] as const,
    payoutMethods: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'payoutMethods', doctorId, pagination] as const,
    appointments: (
      doctorId: number,
      filters?: { status?: string; startDate?: string; endDate?: string },
      pagination?: PaginationParams
    ) => [...queryKeys.doctors.all, 'appointments', doctorId, { filters, pagination }] as const,
    reviews: (doctorId: number, pagination?: PaginationParams) =>
      [...queryKeys.doctors.all, 'reviews', doctorId, pagination] as const,
  },

  // Persons (complex entity with 5 sub-resources)
  persons: {
    all: ['persons'] as const,
    lists: () => [...queryKeys.persons.all, 'list'] as const,
    list: (filters?: { search?: string }, pagination?: PaginationParams) =>
      [...queryKeys.persons.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.persons.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.persons.details(), id] as const,

    // Sub-resources
    phones: (personId: number, pagination?: PaginationParams) =>
      [...queryKeys.persons.all, 'phones', personId, pagination] as const,
    paymentMethods: (personId: number, pagination?: PaginationParams) =>
      [...queryKeys.persons.all, 'paymentMethods', personId, pagination] as const,
    appointments: (
      personId: number,
      filters?: { status?: string; startDate?: string; endDate?: string },
      pagination?: PaginationParams
    ) => [...queryKeys.persons.all, 'appointments', personId, { filters, pagination }] as const,
    payments: (personId: number, pagination?: PaginationParams) =>
      [...queryKeys.persons.all, 'payments', personId, pagination] as const,
    progresses: (personId: number, pagination?: PaginationParams) =>
      [...queryKeys.persons.all, 'progresses', personId, pagination] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: { search?: string; role?: string }, pagination?: PaginationParams) =>
      [...queryKeys.users.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },

  // Appointments (dynamic data)
  appointments: {
    all: ['appointments'] as const,
    lists: () => [...queryKeys.appointments.all, 'list'] as const,
    list: (
      filters?: {
        personId?: number;
        doctorId?: number;
        status?: string;
        startDate?: string;
        endDate?: string;
      },
      pagination?: PaginationParams
    ) => [...queryKeys.appointments.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.appointments.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.appointments.details(), id] as const,
  },

  // Payments (dynamic data)
  payments: {
    all: ['payments'] as const,
    lists: () => [...queryKeys.payments.all, 'list'] as const,
    list: (
      filters?: {
        personId?: number;
        appointmentId?: number;
        startDate?: string;
        endDate?: string;
      },
      pagination?: PaginationParams
    ) => [...queryKeys.payments.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.payments.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.payments.details(), id] as const,
  },

  // Progresses (dynamic data)
  progresses: {
    all: ['progresses'] as const,
    lists: () => [...queryKeys.progresses.all, 'list'] as const,
    list: (filters?: { personId?: number }, pagination?: PaginationParams) =>
      [...queryKeys.progresses.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.progresses.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.progresses.details(), id] as const,
  },

  // Reviews (dynamic data)
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (filters?: { doctorId?: number }, pagination?: PaginationParams) =>
      [...queryKeys.reviews.lists(), { filters, pagination }] as const,
    details: () => [...queryKeys.reviews.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.reviews.details(), id] as const,
  },
} as const;
