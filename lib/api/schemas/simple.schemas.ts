import * as z from "zod";
import {
  shortTextSchema,
  mediumTextSchema,
  longTextSchema,
  numericIdSchema,
  institutionTypeSchema,
  paginationSchema,
  searchQuerySchema,
  optionalIdFilterSchema,
  booleanFilterSchema,
  durationSchema,
} from "./common.schemas";
import { Service } from "@/src/types";

/**
 * Validation schemas for simple/reference data entities
 * These are mostly admin-managed lookup tables
 */

// ============================================================================
// SERVICE
// ============================================================================

const serviceKeys = Object.keys(Service) as [Service, ...Service[]];

/**
 * Schema for creating a service
 */
export const createServiceSchema = z.object({
  name: z.enum(serviceKeys),
  description: mediumTextSchema,
  duration: durationSchema.default(45), // Default 45 minutes
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

/**
 * Schema for updating a service
 */
export const updateServiceSchema = createServiceSchema.partial();

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

/**
 * Schema for listing services
 */
export const listServicesSchema = paginationSchema.extend({
  search: searchQuerySchema,
});

export type ListServicesInput = z.infer<typeof listServicesSchema>;

// ============================================================================
// CONDITION
// ============================================================================

/**
 * Schema for creating a condition
 */
export const createConditionSchema = z.object({
  name: shortTextSchema,
});

export type CreateConditionInput = z.infer<typeof createConditionSchema>;

/**
 * Schema for updating a condition
 */
export const updateConditionSchema = createConditionSchema.partial();

export type UpdateConditionInput = z.infer<typeof updateConditionSchema>;

/**
 * Schema for listing conditions
 */
export const listConditionsSchema = paginationSchema.extend({
  search: searchQuerySchema,
});

export type ListConditionsInput = z.infer<typeof listConditionsSchema>;

// ============================================================================
// LANGUAGE
// ============================================================================

/**
 * Schema for creating a language
 */
export const createLanguageSchema = z.object({
  name: shortTextSchema,
});

export type CreateLanguageInput = z.infer<typeof createLanguageSchema>;

/**
 * Schema for updating a language
 */
export const updateLanguageSchema = createLanguageSchema.partial();

export type UpdateLanguageInput = z.infer<typeof updateLanguageSchema>;

/**
 * Schema for listing languages
 */
export const listLanguagesSchema = paginationSchema.extend({
  search: searchQuerySchema,
});

export type ListLanguagesInput = z.infer<typeof listLanguagesSchema>;

// ============================================================================
// PLACE
// ============================================================================

/**
 * Schema for creating a place (LocationIQ format)
 */
export const createPlaceSchema = z.object({
  osmId: z.string().min(1).max(50),
  osmType: z.enum(["node", "way", "relation"]),
  displayName: z.string().min(1).max(500),
  displayPlace: z.string().min(1).max(255),
  displayAddress: z.string().max(500).optional(),
  class: z.string().max(100).optional(),
  type: z.string().min(1).max(100),
  city: z.string().max(255).optional(),
  state: z.string().max(255).optional(),
  country: z.string().max(255).optional(),
  postcode: z.string().max(20).optional(),
  lat: z.string().regex(/^-?\d+\.?\d*$/), // Decimal string
  lon: z.string().regex(/^-?\d+\.?\d*$/),
});

export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;

/**
 * Schema for updating a place
 */
export const updatePlaceSchema = createPlaceSchema.partial();

export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;

/**
 * Schema for listing places
 */
export const listPlacesSchema = paginationSchema.extend({
  search: searchQuerySchema,
  type: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

export type ListPlacesInput = z.infer<typeof listPlacesSchema>;

// ============================================================================
// INSTITUTION
// ============================================================================

/**
 * Schema for creating an institution
 * Doctors can create with isPending = true (awaiting admin verification)
 * Admins create with isVerified = true
 */
export const createInstitutionSchema = z.object({
  name: shortTextSchema,
  type: institutionTypeSchema, // university, hospital, clinic, research_center, other
  placeId: numericIdSchema,
  isVerified: z.boolean().default(false).optional(),
});

export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;

/**
 * Schema for updating an institution
 */
export const updateInstitutionSchema = createInstitutionSchema.partial();

export type UpdateInstitutionInput = z.infer<typeof updateInstitutionSchema>;

/**
 * Schema for listing institutions
 */
export const listInstitutionsSchema = paginationSchema.extend({
  search: searchQuerySchema,
  type: institutionTypeSchema.optional(),
  placeId: optionalIdFilterSchema,
  isVerified: booleanFilterSchema,
});

export type ListInstitutionsInput = z.infer<typeof listInstitutionsSchema>;

// ============================================================================
// PROGRESS (Patient Progress Tracking)
// ============================================================================

/**
 * Schema for creating a progress record
 * Doctors create progress records for their assigned patients
 * appointmentId is optional - progress can be linked to an appointment or standalone
 */
export const createProgressSchema = z.object({
  personId: numericIdSchema,
  appointmentId: numericIdSchema.optional(),
  conditionId: numericIdSchema.optional(),
  title: shortTextSchema,
  level: z.string().max(100).optional(),
  notes: longTextSchema.optional(),
});

export type CreateProgressInput = z.infer<typeof createProgressSchema>;

/**
 * Schema for updating a progress record
 */
export const updateProgressSchema = createProgressSchema.omit({ personId: true }).partial();

export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;

/**
 * Schema for listing progress records
 */
export const listProgressesSchema = paginationSchema.extend({
  personId: optionalIdFilterSchema,
  conditionId: optionalIdFilterSchema,
  search: searchQuerySchema, // Search in title, notes
});

export type ListProgressesInput = z.infer<typeof listProgressesSchema>;
