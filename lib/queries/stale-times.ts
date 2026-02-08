/**
 * Dynamic stale time configuration based on data update frequency
 */

// Reference Data (24 hours) - Admin-managed, rarely change
export const REFERENCE_DATA_STALE_TIME = 24 * 60 * 60 * 1000;

export const STALE_TIMES = {
  // Reference Data (24 hours)
  LANGUAGES: REFERENCE_DATA_STALE_TIME,
  CONDITIONS: REFERENCE_DATA_STALE_TIME,
  SERVICES: REFERENCE_DATA_STALE_TIME,
  TREATMENT_METHODS: REFERENCE_DATA_STALE_TIME,
  PLACES: REFERENCE_DATA_STALE_TIME,

  // Semi-Static Data (30 minutes) - Doctors and institutional data
  DOCTORS: 30 * 60 * 1000,
  DOCTOR_PROFILE: 30 * 60 * 1000,
  DOCTOR_SERVICES: 30 * 60 * 1000,
  DOCTOR_SCHEDULES: 30 * 60 * 1000,
  DOCTOR_EDUCATIONS: 30 * 60 * 1000,
  DOCTOR_AGE_GROUPS: 30 * 60 * 1000,
  DOCTOR_CONDITIONS: 30 * 60 * 1000,
  DOCTOR_LANGUAGES: 30 * 60 * 1000,
  DOCTOR_TREATMENT_METHODS: 30 * 60 * 1000,
  DOCTOR_PHONES: 30 * 60 * 1000,
  INSTITUTIONS: 30 * 60 * 1000,
  DOCTOR_REVIEWS: 30 * 60 * 1000,

  // Person Data (30 minutes for profile, 15 minutes for contact info)
  PERSONS: 30 * 60 * 1000,
  PERSON_PROFILE: 30 * 60 * 1000,
  PERSON_PHONES: 15 * 60 * 1000,

  // User/Auth Data (15 minutes)
  USERS: 15 * 60 * 1000,

  // Dynamic Data (5 minutes) - Transactional data
  PAYMENTS: 5 * 60 * 1000,
  PROGRESSES: 5 * 60 * 1000,
  REVIEWS: 5 * 60 * 1000,

  // Dynamic Data (2 minutes) - Payment methods and appointments need fresher cache
  PAYMENT_METHODS: 2 * 60 * 1000,
  PAYOUT_METHODS: 2 * 60 * 1000,
  PERSON_PAYMENTS: 2 * 60 * 1000,
  DOCTOR_PAYOUT_METHODS: 2 * 60 * 1000,
  APPOINTMENTS: 2 * 60 * 1000,
  DOCTOR_APPOINTMENTS: 2 * 60 * 1000,
  PERSON_APPOINTMENTS: 2 * 60 * 1000,
} as const;

export type StaleTimeKey = keyof typeof STALE_TIMES;

/**
 * Helper function to get stale time for an entity
 */
export function getStaleTime(entity: StaleTimeKey): number {
  return STALE_TIMES[entity];
}
