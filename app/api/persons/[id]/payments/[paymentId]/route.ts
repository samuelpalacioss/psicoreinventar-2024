import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { persons, payments, paymentMethods, payoutMethods } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
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

    // Fetch the payment with all related details
    const [payment] = await db
      .select({
        id: payments.id,
        personId: payments.personId,
        paymentMethodId: payments.paymentMethodId,
        payoutMethodId: payments.payoutMethodId,
        amount: payments.amount,
        date: payments.date,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        paymentMethod: {
          id: paymentMethods.id,
          type: paymentMethods.type,
          // Card fields (token should NOT be exposed for security)
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
        payoutMethod: {
          id: payoutMethods.id,
          type: payoutMethods.type,
          // Bank Transfer fields
          bankName: payoutMethods.bankName,
          accountNumber: payoutMethods.accountNumber,
          accountType: payoutMethods.accountType,
          // Pago Móvil fields
          pagoMovilPhone: payoutMethods.pagoMovilPhone,
          pagoMovilBankCode: payoutMethods.pagoMovilBankCode,
          pagoMovilCi: payoutMethods.pagoMovilCi,
          nickname: payoutMethods.nickname,
        },
      })
      .from(payments)
      .leftJoin(paymentMethods, eq(payments.paymentMethodId, paymentMethods.id))
      .leftJoin(payoutMethods, eq(payments.payoutMethodId, payoutMethods.id))
      .where(and(eq(payments.id, paymentId), eq(payments.personId, personId)));

    if (!payment) {
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
