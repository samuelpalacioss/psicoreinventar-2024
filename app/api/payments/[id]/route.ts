import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { payments, paymentMethods } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/payments/[id]
 * Get a single payment by ID
 * Access:
 * - Patient: Own payments only
 * - Doctor: Assigned patients' payments
 * - Admin: All payments (read-only)
 *
 * Note: Payments are financial records and cannot be deleted
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const paymentId = parseInt(paramsValidationResult.data.id);

  try {
    // First, fetch only the personId to check authorization before accessing sensitive data
    const [paymentMinimal] = await db
      .select({
        personId: payments.personId,
      })
      .from(payments)
      .where(eq(payments.id, paymentId));

    if (!paymentMinimal) {
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

    // Authorization check - verify user can read this payment BEFORE fetching sensitive data
    const authzResult = await checkResourceAccess(userId, role as Role, "payment", "read", paymentMinimal.personId);
    if (!authzResult.allowed) return authzResult.error;

    // Now fetch the full payment data with related information
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
          // Card fields (token never exposed)
          cardLast4: paymentMethods.cardLast4,
          cardHolderName: paymentMethods.cardHolderName,
          cardBrand: paymentMethods.cardBrand,
          // Pago Móvil fields
          pagoMovilPhone: paymentMethods.pagoMovilPhone,
          pagoMovilBankCode: paymentMethods.pagoMovilBankCode,
        },
      })
      .from(payments)
      .leftJoin(paymentMethods, eq(payments.paymentMethodId, paymentMethods.id))
      .where(eq(payments.id, paymentId));

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
