import * as z from "zod";
import {
  ciSchema,
  nameSchema,
  optionalNameSchema,
  birthDateSchema,
  addressSchema,
  placeIdSchema,
  paginationSchema,
  searchQuerySchema,
  booleanFilterSchema,
} from "./common.schemas";

/**
 * Validation schemas for Person (Patient) entity
 */

// ============================================================================
// CREATE PERSON
// ============================================================================

/**
 * Schema for creating a new person/patient profile
 * userId is taken from session, not from request body
 */
export const createPersonSchema = z.object({
  ci: ciSchema,
  firstName: nameSchema,
  middleName: optionalNameSchema,
  firstLastName: nameSchema,
  secondLastName: optionalNameSchema,
  birthDate: birthDateSchema,
  address: addressSchema,
  placeId: placeIdSchema,
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;

// ============================================================================
// UPDATE PERSON
// ============================================================================

/**
 * Schema for updating a person/patient profile
 * All fields are optional (partial update)
 */
export const updatePersonSchema = createPersonSchema.partial();

export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;

// ============================================================================
// LIST PERSONS
// ============================================================================

/**
 * Schema for listing/filtering persons
 * Includes pagination and filter parameters
 */
export const listPersonsSchema = paginationSchema.extend({
  search: searchQuerySchema, // Search in firstName, lastName
  placeId: z.coerce.number().int().positive().optional(),
  isActive: booleanFilterSchema,
});

export type ListPersonsInput = z.infer<typeof listPersonsSchema>;

// ============================================================================
// PERSON PHONE
// ============================================================================

/**
 * Schema for adding/updating person phone numbers
 */
export const personPhoneSchema = z.object({
  areaCode: z.number().int().min(100).max(9999),
  number: z.number().int().min(1000000).max(9999999),
});

export type PersonPhoneInput = z.infer<typeof personPhoneSchema>;
