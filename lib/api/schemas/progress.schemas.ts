import * as z from "zod";
import { paginationSchema, optionalIdFilterSchema } from "./common.schemas";

/**
 * Validation schemas for Progress entity
 * Progress notes are created by doctors for their assigned patients
 */

// ============================================================================
// CREATE/UPDATE PROGRESS
// ============================================================================

/**
 * Schema for creating a progress note
 * Business rules:
 * - Only doctors can create progress notes for their assigned patients
 * - appointmentId and conditionId are optional
 */
export const createProgressSchema = z.object({
  personId: z.number().int().positive({ message: "Person ID must be a positive integer" }),
  appointmentId: z.number().int().positive().optional(),
  conditionId: z.number().int().positive().optional(),
  title: z.string().min(1).max(255, { message: "Title must be between 1 and 255 characters" }),
  level: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export type CreateProgressInput = z.infer<typeof createProgressSchema>;

/**
 * Schema for updating a progress note
 * Doctors can update their own progress notes for assigned patients
 */
export const updateProgressSchema = createProgressSchema.omit({ personId: true }).partial();

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

// ============================================================================
// LIST PROGRESS
// ============================================================================

/**
 * Schema for listing/filtering progress notes
 * Includes pagination and filter parameters
 */
export const listProgressSchema = paginationSchema.extend({
  personId: optionalIdFilterSchema,
  doctorId: optionalIdFilterSchema,
  appointmentId: optionalIdFilterSchema,
  conditionId: optionalIdFilterSchema,
});

export type ListProgressInput = z.infer<typeof listProgressSchema>;
