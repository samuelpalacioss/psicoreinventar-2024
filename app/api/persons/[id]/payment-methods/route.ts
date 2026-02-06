import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateParams, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema, paginationSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { persons, paymentMethodPersons, paymentMethods } from "@/src/db/schema";
import { and, count, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";

/**
 * GET /api/persons/[id]/payment-methods
 * List all payment methods for a person
 * Access:
 * - Patient: Own payment methods only
 * - Admin: All payment methods
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
      .from(paymentMethodPersons)
      .where(eq(paymentMethodPersons.personId, personId));

    // Get paginated payment methods with details
    const personPaymentMethods = await db
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
      .where(eq(paymentMethodPersons.personId, personId))
      .limit(limit)
      .offset(offset);

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json(
      {
        success: true,
        data: personPaymentMethods,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching person payment methods:", error);
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


