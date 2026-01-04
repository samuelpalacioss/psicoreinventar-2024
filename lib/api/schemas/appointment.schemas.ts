import * as z from "zod";
import {
  numericIdSchema,
  dateTimeSchema,
  appointmentStatusSchema,
  longTextSchema,
  paginationSchema,
  optionalIdFilterSchema,
  booleanFilterSchema,
} from "./common.schemas";

/**
 * Validation schemas for Appointment entity
 * Includes business logic validation for booking appointments
 */

// ============================================================================
// CREATE APPOINTMENT
// ============================================================================

/**
 * Schema for creating a new appointment
 * Business rules:
 * - startDateTime must be at least 24 hours in the future
 * - Doctor must have the specified service
 * - Payment method must belong to the patient
 * - Time slot must be available (checked in handler)
 */
export const createAppointmentSchema = z.object({
  doctorId: numericIdSchema,
  serviceId: numericIdSchema,
  paymentMethodId: numericIdSchema,
  startDateTime: z.string().datetime().refine(
    (val) => {
      const appointmentDate = new Date(val);
      const now = new Date();
      const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursDiff >= 24;
    },
    { message: "Appointment must be booked at least 24 hours in advance" }
  ),
  notes: longTextSchema.optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

// ============================================================================
// UPDATE APPOINTMENT
// ============================================================================

/**
 * Schema for updating an appointment
 * Can update status and notes
 */
export const updateAppointmentSchema = z.object({
  status: appointmentStatusSchema.optional(),
  notes: longTextSchema.optional(),
  cancellationReason: longTextSchema.optional(),
}).refine(
  (data) => {
    // If status is cancelled, cancellationReason is required
    if (data.status === "cancelled") {
      return !!data.cancellationReason;
    }
    return true;
  },
  {
    message: "Cancellation reason is required when status is cancelled",
    path: ["cancellationReason"],
  }
);

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

// ============================================================================
// CANCEL APPOINTMENT
// ============================================================================

/**
 * Schema for cancelling an appointment
 * Patients can cancel up to 24 hours before, admins can cancel anytime
 */
export const cancelAppointmentSchema = z.object({
  cancellationReason: longTextSchema,
});

export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;

// ============================================================================
// LIST APPOINTMENTS
// ============================================================================

/**
 * Schema for listing/filtering appointments
 * Includes pagination and filter parameters
 */
export const listAppointmentsSchema = paginationSchema.extend({
  doctorId: optionalIdFilterSchema,
  personId: optionalIdFilterSchema,
  status: appointmentStatusSchema.optional(),
  startDate: z.string().datetime().optional(), // Filter appointments from this date
  endDate: z.string().datetime().optional(), // Filter appointments until this date
});

export type ListAppointmentsInput = z.infer<typeof listAppointmentsSchema>;

// ============================================================================
// APPOINTMENT REVIEW
// ============================================================================

/**
 * Schema for creating a review after appointment completion
 * Business rules:
 * - Appointment must be completed
 * - Only patient can create review
 * - One review per appointment
 */
export const createReviewSchema = z.object({
  score: z.number().int().min(1).max(5, { message: "Score must be between 1 and 5" }),
  description: longTextSchema.optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * Schema for updating a review (patient only)
 */
export const updateReviewSchema = createReviewSchema.partial();

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

// ============================================================================
// LIST REVIEWS
// ============================================================================

/**
 * Schema for listing/filtering reviews
 */
export const listReviewsSchema = paginationSchema.extend({
  doctorId: optionalIdFilterSchema,
  minScore: z.coerce.number().int().min(1).max(5).optional(),
  maxScore: z.coerce.number().int().min(1).max(5).optional(),
});

export type ListReviewsInput = z.infer<typeof listReviewsSchema>;
