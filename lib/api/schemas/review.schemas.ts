import * as z from "zod";
import { paginationSchema, optionalIdFilterSchema } from "./common.schemas";

/**
 * Validation schemas for Review entity
 * Reviews are per doctor per patient (not per appointment)
 */

// ============================================================================
// CREATE/UPDATE REVIEW
// ============================================================================

/**
 * Schema for creating or updating a review for a doctor
 * Business rules:
 * - Patient must have at least one completed appointment with the doctor
 * - One review per doctor per patient (upsert behavior)
 * - Score must be between 1-5
 */
export const createReviewSchema = z.object({
  score: z.number().int().min(1).max(5, { message: "Score must be between 1 and 5" }),
  description: z.string().max(1000).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/**
 * Schema for updating a review
 * Patients can update their own reviews, admins can moderate all reviews
 */
export const updateReviewSchema = createReviewSchema.partial();

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

// ============================================================================
// LIST REVIEWS
// ============================================================================

/**
 * Schema for listing/filtering reviews
 * Includes pagination and filter parameters
 */
export const listReviewsSchema = paginationSchema.extend({
  doctorId: optionalIdFilterSchema,
  personId: optionalIdFilterSchema,
  minScore: z.coerce.number().int().min(1).max(5).optional(),
  maxScore: z.coerce.number().int().min(1).max(5).optional(),
});

export type ListReviewsInput = z.infer<typeof listReviewsSchema>;
