import * as z from "zod";
import {
  numericIdSchema,
  amountSchema,
  dateStringSchema,
  paymentMethodTypeSchema,
  payoutTypeSchema,
  payoutStatusSchema,
  ciSchema,
  paginationSchema,
  optionalIdFilterSchema,
  shortTextSchema,
} from "./common.schemas";

/**
 * Validation schemas for Payment, PaymentMethod, and Payout entities
 * PaymentMethod uses discriminated union for card vs pago_movil
 */

// ============================================================================
// PAYMENT METHOD - DISCRIMINATED UNION
// ============================================================================

/**
 * Base payment method schema
 */
const basePaymentMethodSchema = z.object({
  type: paymentMethodTypeSchema,
});

/**
 * Card payment method subtype
 * Uses payment gateway tokenization (Stripe, PayPal, etc.)
 * Frontend should send card details directly to gateway and receive token
 */
const cardPaymentMethodSchema = basePaymentMethodSchema.extend({
  type: z.literal("card"),
  cardToken: z.string().min(1).max(255), // Payment gateway token (e.g., Stripe pm_xxx or tok_xxx)
  cardLast4: z.string().length(4, "Last 4 digits of card required"),
  cardHolderName: z.string().min(1).max(255),
  cardBrand: z.string().min(1).max(50), // Visa, Mastercard, Amex, etc.
  expirationMonth: z.number().int().min(1).max(12),
  expirationYear: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 20),
});

/**
 * Pago Móvil payment method subtype
 */
const pagoMovilPaymentMethodSchema = basePaymentMethodSchema.extend({
  type: z.literal("pago_movil"),
  pagoMovilPhone: z.string().min(10).max(20),
  pagoMovilBankCode: z.string().min(1).max(10),
  pagoMovilCi: ciSchema,
});

/**
 * Schema for creating a payment method (discriminated union)
 * Either card OR pago_movil fields must be provided based on type
 */
export const createPaymentMethodSchema = z.discriminatedUnion("type", [
  cardPaymentMethodSchema,
  pagoMovilPaymentMethodSchema,
]);

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;

/**
 * Schema for updating a payment method
 */
export const updatePaymentMethodSchema = z.discriminatedUnion("type", [
  cardPaymentMethodSchema.partial().required({ type: true }),
  pagoMovilPaymentMethodSchema.partial().required({ type: true }),
]);

export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;

// ============================================================================
// PAYMENT METHOD - PERSON ASSOCIATION
// ============================================================================

/**
 * Schema for associating a payment method with a person
 */
export const createPaymentMethodPersonSchema = z.object({
  paymentMethodId: numericIdSchema,
  nickname: z.string().min(1).max(100),
  isPreferred: z.boolean().default(false),
});

export type CreatePaymentMethodPersonInput = z.infer<typeof createPaymentMethodPersonSchema>;

/**
 * Schema for updating payment method-person association
 */
export const updatePaymentMethodPersonSchema = createPaymentMethodPersonSchema.partial();

export type UpdatePaymentMethodPersonInput = z.infer<typeof updatePaymentMethodPersonSchema>;

/**
 * Schema for updating payment method-person association with payment method details
 * Allows updating both the association (nickname, isPreferred) and the underlying payment method details
 */
export const updatePaymentMethodPersonWithDetailsSchema = z.object({
  // Association fields (from paymentMethodPersons table)
  nickname: z.string().min(1).max(100).optional(),
  isPreferred: z.boolean().optional(),

  // Payment method detail fields (from paymentMethods table)
  // Card fields - only valid when updating a card payment method
  cardToken: z.string().min(1).max(255).optional(),
  cardLast4: z.string().length(4, "Last 4 digits of card required").optional(),
  cardHolderName: z.string().min(1).max(255).optional(),
  cardBrand: z.string().min(1).max(50).optional(),
  expirationMonth: z.number().int().min(1).max(12).optional(),
  expirationYear: z.number().int().min(new Date().getFullYear()).max(new Date().getFullYear() + 20).optional(),

  // Pago Móvil fields - only valid when updating a pago_movil payment method
  pagoMovilPhone: z.string().min(10).max(20).optional(),
  pagoMovilBankCode: z.string().min(1).max(10).optional(),
  pagoMovilCi: ciSchema.optional(),
});

export type UpdatePaymentMethodPersonWithDetailsInput = z.infer<typeof updatePaymentMethodPersonWithDetailsSchema>;

/**
 * Helper type to extract card payment method field names
 */
type CardPaymentMethodFields = Extract<
  keyof UpdatePaymentMethodPersonWithDetailsInput,
  "cardToken" | "cardLast4" | "cardHolderName" | "cardBrand" | "expirationMonth" | "expirationYear"
>;

/**
 * Helper type to extract pago móvil payment method field names
 */
type PagoMovilPaymentMethodFields = Extract<
  keyof UpdatePaymentMethodPersonWithDetailsInput,
  "pagoMovilPhone" | "pagoMovilBankCode" | "pagoMovilCi"
>;

/**
 * Array of card payment method field names (extracted from schema)
 */
export const cardPaymentMethodFields: readonly CardPaymentMethodFields[] = [
  "cardToken",
  "cardLast4",
  "cardHolderName",
  "cardBrand",
  "expirationMonth",
  "expirationYear",
] as const;

/**
 * Array of pago móvil payment method field names (extracted from schema)
 */
export const pagoMovilPaymentMethodFields: readonly PagoMovilPaymentMethodFields[] = [
  "pagoMovilPhone",
  "pagoMovilBankCode",
  "pagoMovilCi",
] as const;

// ============================================================================
// PAYMENT (Transaction Records)
// ============================================================================

/**
 * Schema for creating a payment
 * Typically created automatically when booking appointment
 */
export const createPaymentSchema = z.object({
  personId: numericIdSchema,
  paymentMethodId: numericIdSchema,
  payoutMethodId: numericIdSchema,
  amount: amountSchema,
  date: dateStringSchema,
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

/**
 * Schema for listing/filtering payments
 */
export const listPaymentsSchema = paginationSchema.extend({
  personId: optionalIdFilterSchema,
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
});

export type ListPaymentsInput = z.infer<typeof listPaymentsSchema>;

// ============================================================================
// PAYOUT - DISCRIMINATED UNION
// ============================================================================

/**
 * Base payout schema
 */
const basePayoutSchema = z.object({
  type: payoutTypeSchema,
  amount: amountSchema,
});

/**
 * Bank transfer payout subtype
 */
const bankTransferPayoutSchema = basePayoutSchema.extend({
  type: z.literal("bank_transfer"),
  bankName: shortTextSchema,
  accountNumber: z.string().min(1).max(50),
  accountType: z.enum(["checking", "savings"]),
});

/**
 * Pago Móvil payout subtype
 */
const pagoMovilPayoutSchema = basePayoutSchema.extend({
  type: z.literal("pago_movil"),
  pagoMovilPhone: z.string().min(10).max(20),
  pagoMovilBankCode: z.string().min(1).max(10),
  pagoMovilCi: ciSchema,
});

/**
 * Schema for creating a payout (admin only)
 * Discriminated union for bank_transfer vs pago_movil
 */
export const createPayoutSchema = z.discriminatedUnion("type", [
  bankTransferPayoutSchema,
  pagoMovilPayoutSchema,
]);

export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;

/**
 * Schema for updating payout status (admin only)
 */
export const updatePayoutSchema = z.object({
  status: payoutStatusSchema,
  processedAt: z.string().datetime().optional(),
});

export type UpdatePayoutInput = z.infer<typeof updatePayoutSchema>;

/**
 * Schema for listing/filtering payouts
 */
export const listPayoutsSchema = paginationSchema.extend({
  doctorId: optionalIdFilterSchema,
  status: payoutStatusSchema.optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
});

export type ListPayoutsInput = z.infer<typeof listPayoutsSchema>;
