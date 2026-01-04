import * as z from "zod";

/**
 * Common validation schemas used across all entities
 * Enum values match those defined in src/db/schema.ts
 */

// ============================================================================
// ID VALIDATION
// ============================================================================

/**
 * Validate numeric ID parameters from route params
 * Example: /api/persons/[id] where id should be a positive integer
 */
export const idParamSchema = z.object({
  id: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "ID must be a positive number",
  }),
});

/**
 * Validate numeric ID in request body
 */
export const numericIdSchema = z.number().int().positive({
  message: "ID must be a positive integer",
});

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Pagination query parameters
 * Used in list endpoints
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
});

// ============================================================================
// DATES
// ============================================================================

/**
 * Date string validation (YYYY-MM-DD format)
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: "Invalid date" }
  );

/**
 * Birth date validation (must be in the past, reasonable age range)
 */
export const birthDateSchema = dateStringSchema.refine(
  (val) => {
    const date = new Date(val);
    const now = new Date();
    const age = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return age >= 0 && age <= 120;
  },
  { message: "Birth date must be valid and person must be between 0 and 120 years old" }
);

/**
 * Future date validation (for appointments)
 */
export const futureDateSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return date > new Date();
  },
  { message: "Date must be in the future" }
);

/**
 * DateTime string validation (ISO 8601)
 */
export const dateTimeSchema = z.string().datetime({
  message: "Must be a valid ISO 8601 datetime string",
});

// ============================================================================
// PHONE NUMBERS
// ============================================================================

/**
 * Venezuelan area code (0412, 0414, 0424, 0416, 0426, etc.)
 */
export const areaCodeSchema = z.number().int().min(100).max(9999, {
  message: "Area code must be a valid number (e.g., 412, 414, 424)",
});

/**
 * Phone number (7 digits for Venezuelan format)
 */
export const phoneNumberSchema = z.number().int().min(1000000).max(9999999, {
  message: "Phone number must be 7 digits",
});

/**
 * Full phone validation
 */
export const phoneSchema = z.object({
  areaCode: areaCodeSchema,
  number: phoneNumberSchema,
});

// ============================================================================
// IDENTIFICATION
// ============================================================================

/**
 * Venezuelan CI (Cédula de Identidad)
 * Typically 6-8 digits
 */
export const ciSchema = z.number().int().min(100000).max(99999999, {
  message: "CI must be between 6 and 8 digits",
});

// ============================================================================
// ADDRESSES & LOCATIONS
// ============================================================================

/**
 * Address validation
 */
export const addressSchema = z.string().min(5).max(500, {
  message: "Address must be between 5 and 500 characters",
});

/**
 * Place ID validation
 */
export const placeIdSchema = numericIdSchema;

// ============================================================================
// TEXT FIELDS
// ============================================================================

/**
 * Name fields (first name, last name, etc.)
 */
export const nameSchema = z.string().min(1).max(100, {
  message: "Name must be between 1 and 100 characters",
});

/**
 * Optional name fields
 */
export const optionalNameSchema = z.string().max(100).optional();

/**
 * Short text (255 chars)
 */
export const shortTextSchema = z.string().min(1).max(255);

/**
 * Medium text (500 chars)
 */
export const mediumTextSchema = z.string().min(1).max(500);

/**
 * Long text (no max length)
 */
export const longTextSchema = z.string().min(1);

// ============================================================================
// ENUMS (matching src/db/schema.ts)
// ============================================================================

/**
 * User role enum - matches userRoleEnum from schema
 */
export const roleSchema = z.enum(["patient", "doctor", "admin"]);

/**
 * Appointment status enum - matches appointmentStatusEnum from schema
 */
export const appointmentStatusSchema = z.enum(["scheduled", "confirmed", "completed", "cancelled"]);

/**
 * Institution type enum - matches institutionTypeEnum from schema
 */
export const institutionTypeSchema = z.enum(["university", "hospital", "clinic", "research_center", "other"]);

/**
 * Payment method type enum - matches paymentMethodTypeEnum from schema
 */
export const paymentMethodTypeSchema = z.enum(["card", "pago_movil"]);

/**
 * Payout type enum - matches payoutTypeEnum from schema
 */
export const payoutTypeSchema = z.enum(["bank_transfer", "pago_movil"]);

/**
 * Payout status enum - matches payoutStatusEnum from schema
 */
export const payoutStatusSchema = z.enum(["pending", "processing", "completed", "failed"]);

/**
 * Day of week enum - matches dayOfWeekEnum from schema
 */
export const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

/**
 * Condition type enum - matches conditionTypeEnum from schema
 */
export const conditionTypeSchema = z.enum(["primary", "other"]);

/**
 * Language type enum - matches languageTypeEnum from schema
 */
export const languageTypeSchema = z.enum(["native", "foreign"]);

// ============================================================================
// NUMBERS & AMOUNTS
// ============================================================================

/**
 * Monetary amount (positive decimal with 2 decimal places)
 */
export const amountSchema = z
  .number()
  .positive({ message: "Amount must be positive" })
  .multipleOf(0.01, { message: "Amount must have at most 2 decimal places" });

/**
 * Rating/Score (1-5)
 */
export const scoreSchema = z.number().int().min(1).max(5, {
  message: "Score must be between 1 and 5",
});

/**
 * Year validation (4 digits)
 */
export const yearSchema = z.number().int().min(1900).max(new Date().getFullYear() + 10, {
  message: `Year must be between 1900 and ${new Date().getFullYear() + 10}`,
});

/**
 * Duration in minutes (positive integer)
 */
export const durationSchema = z.number().int().positive({
  message: "Duration must be a positive number of minutes",
});

// ============================================================================
// FILTER SCHEMAS
// ============================================================================

/**
 * Boolean filter (for query params that come as strings)
 */
export const booleanFilterSchema = z
  .string()
  .optional()
  .transform((val) => val === "true");

/**
 * Optional numeric ID filter
 */
export const optionalIdFilterSchema = z.coerce.number().int().positive().optional();

/**
 * Search query filter
 */
export const searchQuerySchema = z.string().max(255).optional();
