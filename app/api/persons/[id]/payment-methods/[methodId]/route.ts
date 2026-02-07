import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import {
  updatePaymentMethodPersonWithDetailsSchema,
  cardPaymentMethodFields,
  pagoMovilPaymentMethodFields,
} from "@/lib/api/schemas/payment.schemas";
import { Role } from "@/src/types";
import {
  findPersonById,
  findPersonPaymentMethod,
  editPersonPaymentMethod,
  deletePersonPaymentMethod,
} from "@/src/dal";
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
  const authzResult = await checkResourceAccess(userId, role, "payment-method", "read", personId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Verify person exists
    const person = await findPersonById(personId);

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
    const paymentMethodPerson = await findPersonPaymentMethod(personId, methodId);

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
  const authzResult = await checkResourceAccess(userId, role, "payment-method", "update", personId);
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updatePaymentMethodPersonWithDetailsSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if the payment method association exists for this person
    const existing = await findPersonPaymentMethod(personId, methodId);

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
    if (validatedData.isPreferred !== undefined)
      associationFields.isPreferred = validatedData.isPreferred;

    // Extract payment method fields based on type (from schema)

    // Check for invalid field combinations
    if (paymentMethodType === "card") {
      // Extract card fields
      for (const field of cardPaymentMethodFields) {
        if (validatedData[field] !== undefined) {
          (paymentMethodFields as any)[field] = validatedData[field];
        }
      }

      // Reject pago móvil fields for card payment methods
      const invalidFields = pagoMovilPaymentMethodFields.filter(
        (field) => validatedData[field] !== undefined
      );
      if (invalidFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Cannot update pago móvil fields for a card payment method: ${invalidFields.join(
                ", "
              )}`,
              code: "INVALID_FIELDS",
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
    } else if (paymentMethodType === "pago_movil") {
      // Extract pago móvil fields
      for (const field of pagoMovilPaymentMethodFields) {
        if (validatedData[field] !== undefined) {
          (paymentMethodFields as any)[field] = validatedData[field];
        }
      }

      // Reject card fields for pago móvil payment methods
      const invalidFields = cardPaymentMethodFields.filter(
        (field) => validatedData[field] !== undefined
      );
      if (invalidFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Cannot update card fields for a pago móvil payment method: ${invalidFields.join(
                ", "
              )}`,
              code: "INVALID_FIELDS",
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
    }

    // Use DAL to update (handles transaction for preferred method + association + payment method)
    const hasAssociationFields = Object.keys(associationFields).length > 0;
    const hasPaymentMethodFields = Object.keys(paymentMethodFields).length > 0;

    const completeData = await editPersonPaymentMethod(
      methodId,
      existing.paymentMethodId,
      personId,
      hasAssociationFields ? (associationFields as any) : undefined,
      hasPaymentMethodFields ? (paymentMethodFields as any) : undefined
    );

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
  const authzResult = await checkResourceAccess(userId, role, "payment-method", "delete", personId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Check if the payment method association exists for this person
    const existing = await findPersonPaymentMethod(personId, methodId);

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

    // Delete the association and payment method (DAL handles transaction)
    await deletePersonPaymentMethod(methodId, existing.paymentMethodId);

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
