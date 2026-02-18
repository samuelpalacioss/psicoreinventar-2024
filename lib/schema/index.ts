import * as z from "zod";

// ============================================================================
// PATIENT — derived from persons + phones + users tables
// placeId handled separately (requires location search)
// ============================================================================

export const addPatientSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "Required" })
    .max(100, { message: "Max 100 characters" })
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, { message: "Letters only" }),
  middleName: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, { message: "Letters only" }),
  firstLastName: z
    .string()
    .min(1, { message: "Required" })
    .max(100, { message: "Max 100 characters" })
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, { message: "Letters only" }),
  secondLastName: z
    .string()
    .max(100, { message: "Max 100 characters" })
    .regex(/^[a-zA-ZÀ-ÿ\s]*$/, { message: "Letters only" }),
  email: z.email({ message: "Invalid email address" }),
  ci: z
    .string()
    .min(1, { message: "Required" })
    .max(8, { message: "Max 8 digits" })
    .regex(/^\d+$/, { message: "Digits only" }),
  birthDate: z.string().min(1, { message: "Required" }),
  phoneAreaCode: z
    .string()
    .min(1, { message: "Required" })
    .max(4, { message: "Max 4 digits" })
    .regex(/^\d+$/, { message: "Digits only" }),
  phoneNumber: z
    .string()
    .min(6, { message: "Min 6 digits" })
    .max(7, { message: "Max 7 digits" })
    .regex(/^\d+$/, { message: "Digits only" }),
  address: z
    .string()
    .min(1, { message: "Required" })
    .max(500, { message: "Max 500 characters" }),
});

export type AddPatientSchema = z.infer<typeof addPatientSchema>;

// ============================================================================
// APPOINTMENT — derived from appointments + payments tables
// Payment method / payout method selection handled separately
// ============================================================================

export const addAppointmentSchema = z.object({
  patientId: z
    .string()
    .min(1, { message: "Select a patient" })
    .regex(/^\d+$/, { message: "Digits only" }),
  serviceId: z
    .string()
    .min(1, { message: "Select a service" })
    .regex(/^\d+$/, { message: "Digits only" }),
  startDate: z.string().min(1, { message: "Required" }),
  startTime: z.string().min(1, { message: "Required" }),
  paymentAmount: z
    .string()
    .min(1, { message: "Required" })
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Enter a valid amount" }),
  notes: z.string().max(1000, { message: "Max 1000 characters" }),
});

export type AddAppointmentSchema = z.infer<typeof addAppointmentSchema>;

const signUpBaseSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters long" })
    .max(50, { message: "Full name must be less than 50 characters long" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Can only contain letters and spaces" }),
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

// Client-side schema with confirmPassword validation
export const signUpSchema = signUpBaseSchema
  .extend({
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Server-side schema without confirmPassword (only used in actions)
export const signUpActionSchema = signUpBaseSchema;

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

export type SignInSchema = z.infer<typeof signInSchema>;
