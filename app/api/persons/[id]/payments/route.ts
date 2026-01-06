import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateParams, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema, paginationSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { persons, payments, paymentMethods } from "@/src/db/schema";
import { and, count, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";

/**
 * GET /api/persons/[id]/payments
 * List all payments for a person (read-only)
 * Access:
 * - Patient: Own payments only
 * - Doctor: Assigned patients' payments
 * - Admin: All payments
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

  const personId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to parent person
  const authzResult = await checkResourceAccess(userId, role as Role, "person", "read", personId);
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, paginationSchema);
  if (!validationResult.success) return validationResult.error;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

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

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.personId, personId));

    // Get paginated payments with payment method details
    const personPayments = await db
      .select({
        id: payments.id,
        personId: payments.personId,
        paymentMethodId: payments.paymentMethodId,
        amount: payments.amount,
        date: payments.date,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        paymentMethod: {
          id: paymentMethods.id,
          type: paymentMethods.type,
          // Card fields (masked for security)
          cardNumber: paymentMethods.cardNumber,
          cardBrand: paymentMethods.cardBrand,
          // Pago Móvil fields (partial for security)
          pagoMovilPhone: paymentMethods.pagoMovilPhone,
          pagoMovilBankCode: paymentMethods.pagoMovilBankCode,
        },
      })
      .from(payments)
      .leftJoin(paymentMethods, eq(payments.paymentMethodId, paymentMethods.id))
      .where(eq(payments.personId, personId))
      .orderBy(payments.date)
      .limit(limit)
      .offset(offset);

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json(
      {
        success: true,
        data: personPayments,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching person payments:", error);
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


