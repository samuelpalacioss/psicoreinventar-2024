import * as z from "zod";
import {
  ciSchema,
  nameSchema,
  optionalNameSchema,
  birthDateSchema,
  addressSchema,
  placeIdSchema,
  longTextSchema,
  paginationSchema,
  searchQuerySchema,
  booleanFilterSchema,
  optionalIdFilterSchema,
  numericIdSchema,
  yearSchema,
  shortTextSchema,
  areaCodeSchema,
  phoneNumberSchema,
  dayOfWeekSchema,
} from "./common.schemas";

export const consultationTypeSchema = z.enum(["virtual_only", "in_person", "both"]);

/**
 * Validation schemas for Doctor (Therapist) entity and related resources
 */

// ============================================================================
// CREATE DOCTOR
// ============================================================================

/**
 * Schema for creating a new doctor profile
 * userId is taken from session, not from request body
 * isActive defaults to false (requires admin approval)
 * consultationType defaults to virtual_only
 */
export const createDoctorSchema = z.object({
  ci: ciSchema,
  firstName: nameSchema,
  middleName: optionalNameSchema,
  firstLastName: nameSchema,
  secondLastName: optionalNameSchema,
  birthDate: birthDateSchema,
  address: addressSchema,
  placeId: placeIdSchema.optional(),
  consultationType: consultationTypeSchema.default("virtual_only"),
  biography: longTextSchema,
  firstSessionExpectation: longTextSchema,
  biggestStrengths: longTextSchema,
  practiceStartYear: yearSchema,
}).refine(
  (data) => {
    if (data.consultationType === "virtual_only") {
      return true;
    }
    return data.placeId !== undefined && data.placeId !== null;
  },
  {
    message: "placeId is required when consultationType is 'in_person' or 'both'",
    path: ["placeId"],
  }
);

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;

// ============================================================================
// UPDATE DOCTOR
// ============================================================================

/**
 * Schema for updating a doctor profile
 * All fields are optional (partial update)
 * Refinement applies validation only when consultationType is provided
 */
const baseUpdateDoctorSchema = z.object({
  ci: ciSchema,
  firstName: nameSchema,
  middleName: optionalNameSchema,
  firstLastName: nameSchema,
  secondLastName: optionalNameSchema,
  birthDate: birthDateSchema,
  address: addressSchema,
  placeId: placeIdSchema.optional(),
  consultationType: consultationTypeSchema,
  biography: longTextSchema,
  firstSessionExpectation: longTextSchema,
  biggestStrengths: longTextSchema,
  practiceStartYear: yearSchema,
}).partial();

export const updateDoctorSchema = baseUpdateDoctorSchema.refine(
  (data) => {
    if (data.consultationType === undefined || data.consultationType === "virtual_only") {
      return true;
    }
    return data.placeId !== undefined && data.placeId !== null;
  },
  {
    message: "placeId is required when consultationType is 'in_person' or 'both'",
    path: ["placeId"],
  }
);

export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;

// ============================================================================
// LIST DOCTORS
// ============================================================================

/**
 * Schema for listing/filtering doctors
 * Includes pagination and various filter parameters
 */
export const listDoctorsSchema = paginationSchema.extend({
  search: searchQuerySchema, // Search in name, biography
  placeId: optionalIdFilterSchema,
  serviceId: optionalIdFilterSchema,
  conditionId: optionalIdFilterSchema,
  languageId: optionalIdFilterSchema,
  treatmentMethodId: optionalIdFilterSchema,
  isActive: booleanFilterSchema,
});

export type ListDoctorsInput = z.infer<typeof listDoctorsSchema>;

// ============================================================================
// DOCTOR EDUCATION
// ============================================================================

/**
 * Schema for adding doctor education records
 */
export const createEducationSchema = z
  .object({
    institutionId: numericIdSchema,
    degree: shortTextSchema,
    specialization: shortTextSchema,
    startYear: yearSchema,
    endYear: yearSchema,
  })
  .refine((data) => data.endYear >= data.startYear, {
    message: "End year must be greater than or equal to start year",
    path: ["endYear"],
  });

export type CreateEducationInput = z.infer<typeof createEducationSchema>;

/**
 * Schema for updating doctor education records
 * Refinement only applies when both startYear and endYear are provided
 */
const baseUpdateEducationSchema = z
  .object({
    institutionId: numericIdSchema,
    degree: shortTextSchema,
    specialization: shortTextSchema,
    startYear: yearSchema,
    endYear: yearSchema,
  })
  .partial();

export const updateEducationSchema = baseUpdateEducationSchema.refine(
  (data) => {
    if (data.startYear !== undefined && data.endYear !== undefined) {
      return data.endYear >= data.startYear;
    }
    return true;
  },
  { message: "End year must be greater than or equal to start year", path: ["endYear"] }
);

export type UpdateEducationInput = z.infer<typeof updateEducationSchema>;

// ============================================================================
// DOCTOR SCHEDULE
// ============================================================================

/**
 * Schema for creating doctor schedule (availability)
 * Time format: HH:MM (24-hour format)
 */
export const createScheduleSchema = z
  .object({
    day: dayOfWeekSchema,
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

/**
 * Schema for updating doctor schedule
 * Refinement only applies when both startTime and endTime are provided
 */
const baseUpdateScheduleSchema = z
  .object({
    day: dayOfWeekSchema,
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
  })
  .partial();

export const updateScheduleSchema = baseUpdateScheduleSchema.refine(
  (data) => {
    if (data.startTime !== undefined && data.endTime !== undefined) {
      return data.endTime > data.startTime;
    }
    return true;
  },
  { message: "End time must be after start time", path: ["endTime"] }
);

export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

// ============================================================================
// DOCTOR AGE GROUP
// ============================================================================

/**
 * Schema for creating age group that doctor serves
 */
export const createAgeGroupSchema = z
  .object({
    name: z.string().min(1).max(50),
    minAge: z.number().int().min(0).max(120),
    maxAge: z.number().int().min(0).max(120),
  })
  .refine((data) => data.maxAge >= data.minAge, {
    message: "Max age must be greater than or equal to min age",
    path: ["maxAge"],
  });

export type CreateAgeGroupInput = z.infer<typeof createAgeGroupSchema>;

/**
 * Schema for updating age group
 * Refinement only applies when both minAge and maxAge are provided
 */
const baseUpdateAgeGroupSchema = z
  .object({
    name: z.string().min(1).max(50),
    minAge: z.number().int().min(0).max(120),
    maxAge: z.number().int().min(0).max(120),
  })
  .partial();

export const updateAgeGroupSchema = baseUpdateAgeGroupSchema.refine(
  (data) => {
    if (data.minAge !== undefined && data.maxAge !== undefined) {
      return data.maxAge >= data.minAge;
    }
    return true;
  },
  { message: "Max age must be greater than or equal to min age", path: ["maxAge"] }
);

export type UpdateAgeGroupInput = z.infer<typeof updateAgeGroupSchema>;

// ============================================================================
// DOCTOR PHONE
// ============================================================================

/**
 * Schema for adding/updating doctor phone numbers
 */
export const doctorPhoneSchema = z.object({
  areaCode: areaCodeSchema,
  number: phoneNumberSchema,
});

export type DoctorPhoneInput = z.infer<typeof doctorPhoneSchema>;

// ============================================================================
// DOCTOR SERVICE (Junction Table with Pricing)
// ============================================================================

/**
 * Schema for adding a service to a doctor with pricing
 */
export const addDoctorServiceSchema = z.object({
  serviceId: numericIdSchema,
  amount: z.number().int().positive({ message: "Amount must be a positive integer" }),
});

export type AddDoctorServiceInput = z.infer<typeof addDoctorServiceSchema>;

/**
 * Schema for updating doctor service pricing
 */
export const updateDoctorServiceSchema = z.object({
  amount: z.number().int().positive({ message: "Amount must be a positive integer" }),
});

export type UpdateDoctorServiceInput = z.infer<typeof updateDoctorServiceSchema>;

// ============================================================================
// DOCTOR TREATMENT METHOD (Junction Table)
// ============================================================================

/**
 * Schema for adding a treatment method to a doctor
 */
export const addDoctorTreatmentMethodSchema = z.object({
  treatmentMethodId: numericIdSchema,
});

export type AddDoctorTreatmentMethodInput = z.infer<typeof addDoctorTreatmentMethodSchema>;

// ============================================================================
// DOCTOR CONDITION (Junction Table with Type)
// ============================================================================

/**
 * Schema for adding a condition to a doctor with type
 */
export const addDoctorConditionSchema = z.object({
  conditionId: numericIdSchema,
  type: z.enum(["primary", "other"]),
});

export type AddDoctorConditionInput = z.infer<typeof addDoctorConditionSchema>;

/**
 * Schema for updating doctor condition type
 */
export const updateDoctorConditionSchema = z.object({
  type: z.enum(["primary", "other"]),
});

export type UpdateDoctorConditionInput = z.infer<typeof updateDoctorConditionSchema>;

// ============================================================================
// DOCTOR LANGUAGE (Junction Table with Type)
// ============================================================================

/**
 * Schema for adding a language to a doctor with type
 */
export const addDoctorLanguageSchema = z.object({
  languageId: numericIdSchema,
  type: z.enum(["native", "foreign"]),
});

export type AddDoctorLanguageInput = z.infer<typeof addDoctorLanguageSchema>;

/**
 * Schema for updating doctor language type
 */
export const updateDoctorLanguageSchema = z.object({
  type: z.enum(["native", "foreign"]),
});

export type UpdateDoctorLanguageInput = z.infer<typeof updateDoctorLanguageSchema>;

// ============================================================================
// DOCTOR PAYOUT METHOD
// ============================================================================

export const listDoctorPayoutsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  type: z.enum(["bank_transfer", "pago_movil"]).optional(),
});

export type ListDoctorPayoutsInput = z.infer<typeof listDoctorPayoutsSchema>;

/**
 * Base payout method schema
 */
const basePayoutMethodSchema = z.object({
  type: z.enum(["bank_transfer", "pago_movil"]),
  nickname: z.string().min(1).max(100).optional(),
  isPreferred: z.boolean().default(false),
});

/**
 * Bank transfer payout method subtype
 */
const bankTransferPayoutMethodSchema = basePayoutMethodSchema.extend({
  type: z.literal("bank_transfer"),
  bankName: shortTextSchema,
  accountNumber: z.string().min(1).max(50),
  accountType: z.enum(["checking", "savings"]),
});

/**
 * Pago Móvil payout method subtype
 */
const pagoMovilPayoutMethodSchema = basePayoutMethodSchema.extend({
  type: z.literal("pago_movil"),
  pagoMovilPhone: z.string().min(10).max(20),
  pagoMovilBankCode: z.string().min(1).max(10),
  pagoMovilCi: ciSchema,
});

/**
 * Schema for creating a payout method (discriminated union)
 * Either bank_transfer OR pago_movil fields must be provided based on type
 */
export const createPayoutMethodSchema = z.discriminatedUnion("type", [
  bankTransferPayoutMethodSchema,
  pagoMovilPayoutMethodSchema,
]);

export type CreatePayoutMethodInput = z.infer<typeof createPayoutMethodSchema>;

/**
 * Schema for updating a payout method
 * Allows updating both the payout method details and preferences
 */
export const updatePayoutMethodSchema = z.object({
  // Common fields
  nickname: z.string().min(1).max(100).optional(),
  isPreferred: z.boolean().optional(),

  // Bank transfer fields - only valid when updating a bank_transfer payout method
  bankName: shortTextSchema.optional(),
  accountNumber: z.string().min(1).max(50).optional(),
  accountType: z.enum(["checking", "savings"]).optional(),

  // Pago Móvil fields - only valid when updating a pago_movil payout method
  pagoMovilPhone: z.string().min(10).max(20).optional(),
  pagoMovilBankCode: z.string().min(1).max(10).optional(),
  pagoMovilCi: ciSchema.optional(),
});

export type UpdatePayoutMethodInput = z.infer<typeof updatePayoutMethodSchema>;
