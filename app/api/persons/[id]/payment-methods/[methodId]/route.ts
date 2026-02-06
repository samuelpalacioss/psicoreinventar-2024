import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updatePaymentMethodPersonWithDetailsSchema } from "@/lib/api/schemas/payment.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { persons, paymentMethodPersons, paymentMethods } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const paymentMethodParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid person ID"),
  methodId: z.string().regex(/^\d+$/, "Invalid payment method ID"),
});

/**
 * GET /api/persons/[id]/payment-methods/[methodId]
 * Get a single payment method for a person
 * Access:
 * - Patient: Own payment methods only
 * - Admin: All payment methods (card token is never exposed)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; methodId: string }> }
) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication
  const session = await getAuthSession(request);
  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      },
      { status: StatusCodes.UNAUTHORIZED }
    );
  }

  const { id: userId, role } = session.user;

  const resolvedParams = await params;

  // Validate parameters
  const paramsValidationResult = validateParams(resolvedParams, paymentMethodParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = Number(paramsValidationResult.data.id);
  const methodId = Number(paramsValidationResult.data.methodId);

  // Authorization - check access to parent person resource
  const authzResult = await checkResourceAccess(userId, role as Role, "payment-method", "read", personId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Verify person exists
    const person = await db.query.persons.findFirst({
      where: eq(persons.id, personId),
    });

    if (!person) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Person not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Fetch the payment method association with details
    const [paymentMethodPerson] = await db
      .select({
        id: paymentMethodPersons.id,
        personId: paymentMethodPersons.personId,
        paymentMethodId: paymentMethodPersons.paymentMethodId,
        isPreferred: paymentMethodPersons.isPreferred,
        nickname: paymentMethodPersons.nickname,
        createdAt: paymentMethodPersons.createdAt,
        updatedAt: paymentMethodPersons.updatedAt,
        paymentMethod: {
          id: paymentMethods.id,
          type: paymentMethods.type,
          // Card fields (token should NOT be exposed to frontend for security)
          cardLast4: paymentMethods.cardLast4,
          cardHolderName: paymentMethods.cardHolderName,
          cardBrand: paymentMethods.cardBrand,
          expirationMonth: paymentMethods.expirationMonth,
          expirationYear: paymentMethods.expirationYear,
          // Pago Móvil fields
          pagoMovilPhone: paymentMethods.pagoMovilPhone,
          pagoMovilBankCode: paymentMethods.pagoMovilBankCode,
          pagoMovilCi: paymentMethods.pagoMovilCi,
        },
      })
      .from(paymentMethodPersons)
      .leftJoin(paymentMethods, eq(paymentMethodPersons.paymentMethodId, paymentMethods.id))
      .where(
        and(
          eq(paymentMethodPersons.id, methodId),
          eq(paymentMethodPersons.personId, personId)
        )
      );

    if (!paymentMethodPerson) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payment method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: paymentMethodPerson,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching payment method:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PATCH /api/persons/[id]/payment-methods/[methodId]
 * Update a payment method association and/or payment method details
 * Can update: nickname, isPreferred, card details, or pago móvil details
 * Access:
 * - Patient: Own payment methods only
 * - Admin: No permission
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; methodId: string }> }
) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication
  const session = await getAuthSession(request);
  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      },
      { status: StatusCodes.UNAUTHORIZED }
    );
  }

  const { id: userId, role } = session.user;

  const resolvedParams = await params;

  // Validate parameters
  const paramsValidationResult = validateParams(resolvedParams, paymentMethodParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = Number(paramsValidationResult.data.id);
  const methodId = Number(paramsValidationResult.data.methodId);

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "payment-method", "update", personId);
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updatePaymentMethodPersonWithDetailsSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if the payment method association exists for this person
    const existing = await db.query.paymentMethodPersons.findFirst({
      where: and(
        eq(paymentMethodPersons.id, methodId),
        eq(paymentMethodPersons.personId, personId)
      ),
      with: {
        paymentMethod: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payment method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const paymentMethodType = existing.paymentMethod.type;

    // Separate association fields from payment method detail fields
    const associationFields: Partial<typeof validatedData> = {};
    const paymentMethodFields: Partial<typeof validatedData> = {};

    // Extract association fields
    if (validatedData.nickname !== undefined) associationFields.nickname = validatedData.nickname;
    if (validatedData.isPreferred !== undefined) associationFields.isPreferred = validatedData.isPreferred;

    // Extract payment method fields based on type
    const cardFields = ['cardToken', 'cardLast4', 'cardHolderName', 'cardBrand', 'expirationMonth', 'expirationYear'] as const;
    const pagoMovilFields = ['pagoMovilPhone', 'pagoMovilBankCode', 'pagoMovilCi'] as const;

    // Check for invalid field combinations
    if (paymentMethodType === 'card') {
      // Extract card fields
      for (const field of cardFields) {
        if (validatedData[field] !== undefined) {
          (paymentMethodFields as any)[field] = validatedData[field];
        }
      }

      // Reject pago móvil fields for card payment methods
      const invalidFields = pagoMovilFields.filter(field => validatedData[field] !== undefined);
      if (invalidFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Cannot update pago móvil fields for a card payment method: ${invalidFields.join(', ')}`,
              code: "INVALID_FIELDS",
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
    } else if (paymentMethodType === 'pago_movil') {
      // Extract pago móvil fields
      for (const field of pagoMovilFields) {
        if (validatedData[field] !== undefined) {
          (paymentMethodFields as any)[field] = validatedData[field];
        }
      }

      // Reject card fields for pago móvil payment methods
      const invalidFields = cardFields.filter(field => validatedData[field] !== undefined);
      if (invalidFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Cannot update card fields for a pago móvil payment method: ${invalidFields.join(', ')}`,
              code: "INVALID_FIELDS",
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
    }

    // Perform all updates in a transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // If setting as preferred, unset other preferred methods for this person
      if (validatedData.isPreferred) {
        await tx
          .update(paymentMethodPersons)
          .set({ isPreferred: false, updatedAt: new Date() })
          .where(
            and(
              eq(paymentMethodPersons.personId, personId),
              eq(paymentMethodPersons.isPreferred, true)
            )
          );
      }

      // Update the association if there are association fields
      if (Object.keys(associationFields).length > 0) {
        await tx
          .update(paymentMethodPersons)
          .set({
            ...associationFields,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(paymentMethodPersons.id, methodId),
              eq(paymentMethodPersons.personId, personId)
            )
          );
      }

      // Update the payment method details if there are payment method fields
      if (Object.keys(paymentMethodFields).length > 0) {
        await tx
          .update(paymentMethods)
          .set({
            ...paymentMethodFields,
            updatedAt: new Date(),
          })
          .where(eq(paymentMethods.id, existing.paymentMethodId));
      }
    });

    // Fetch complete data with payment method details
    const [completeData] = await db
      .select({
        id: paymentMethodPersons.id,
        personId: paymentMethodPersons.personId,
        paymentMethodId: paymentMethodPersons.paymentMethodId,
        isPreferred: paymentMethodPersons.isPreferred,
        nickname: paymentMethodPersons.nickname,
        createdAt: paymentMethodPersons.createdAt,
        updatedAt: paymentMethodPersons.updatedAt,
        paymentMethod: {
          id: paymentMethods.id,
          type: paymentMethods.type,
          // Card fields (token should NOT be exposed)
          cardLast4: paymentMethods.cardLast4,
          cardHolderName: paymentMethods.cardHolderName,
          cardBrand: paymentMethods.cardBrand,
          expirationMonth: paymentMethods.expirationMonth,
          expirationYear: paymentMethods.expirationYear,
          // Pago Móvil fields
          pagoMovilPhone: paymentMethods.pagoMovilPhone,
          pagoMovilBankCode: paymentMethods.pagoMovilBankCode,
          pagoMovilCi: paymentMethods.pagoMovilCi,
        },
      })
      .from(paymentMethodPersons)
      .leftJoin(paymentMethods, eq(paymentMethodPersons.paymentMethodId, paymentMethods.id))
      .where(eq(paymentMethodPersons.id, methodId));

    return NextResponse.json(
      {
        success: true,
        data: completeData,
        message: "Payment method updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/persons/[id]/payment-methods/[methodId]
 * Delete a payment method association
 * Access:
 * - Patient: Own payment methods only
 * - Admin: No permission
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; methodId: string }> }
) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication
  const session = await getAuthSession(request);
  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Unauthorized",
          code: "UNAUTHORIZED",
        },
      },
      { status: StatusCodes.UNAUTHORIZED }
    );
  }

  const { id: userId, role } = session.user;

  const resolvedParams = await params;

  // Validate parameters
  const paramsValidationResult = validateParams(resolvedParams, paymentMethodParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = Number(paramsValidationResult.data.id);
  const methodId = Number(paramsValidationResult.data.methodId);

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "payment-method", "delete", personId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Check if the payment method association exists for this person
    const existing = await db.query.paymentMethodPersons.findFirst({
      where: and(
        eq(paymentMethodPersons.id, methodId),
        eq(paymentMethodPersons.personId, personId)
      ),
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payment method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete the association (CASCADE will handle related records)
    await db
      .delete(paymentMethodPersons)
      .where(
        and(
          eq(paymentMethodPersons.id, methodId),
          eq(paymentMethodPersons.personId, personId)
        )
      );

    return NextResponse.json(
      {
        success: true,
        message: "Payment method deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Internal server error",
          code: "INTERNAL_ERROR",
        },
      },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}