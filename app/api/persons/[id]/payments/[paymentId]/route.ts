import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { Role } from "@/src/types";
import { findPersonById, findPaymentById } from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const paymentParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid person ID"),
  paymentId: z.string().regex(/^\d+$/, "Invalid payment ID"),
});

/**
 * GET /api/persons/[id]/payments/[paymentId]
 * Get a single payment for a person
 * Access:
 * - Patient: Own payments only
 * - Doctor: Payments for assigned patients
 * - Admin: All payments
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, paymentParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = Number(paramsValidationResult.data.id);
  const paymentId = Number(paramsValidationResult.data.paymentId);

  // Authorization - check access to parent person resource
  const authzResult = await checkResourceAccess(userId, role as Role, "payment", "read", personId);
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

    // Fetch the payment with all related details
    const payment = await findPaymentById(paymentId);

    if (!payment || payment.personId !== personId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payment not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: payment,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching payment:", error);
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
