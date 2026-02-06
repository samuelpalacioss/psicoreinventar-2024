import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { listPaymentsSchema, createPaymentSchema } from "@/lib/api/schemas/payment.schemas";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { payments, persons, paymentMethods } from "@/src/db/schema";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/payments
 * List payments with filtering
 * Access:
 * - Patient: Own payments only
 * - Doctor: Assigned patients' payments
 * - Admin: All payments (read-only per permissions matrix)
 */
export async function GET(request: NextRequest) {
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

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "payment", "list");
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, listPaymentsSchema);
  if (!validationResult.success) return validationResult.error;
  const queryParams = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Build WHERE conditions based on role and filters
    const conditions = [];

    // Role-based filtering
    if (role === "patient") {
      // Get person ID for the current user
      const person = await db.query.persons.findFirst({
        where: eq(persons.userId, userId),
      });

      if (!person) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Person profile not found",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }

      conditions.push(eq(payments.personId, person.id));
    } else if (role === "doctor") {
      // Doctors see payments for their assigned patients (patients with appointments)
      // This requires a join with appointments table
      // For now, we'll use a subquery approach
      const assignedPersonIds = await db
        .selectDistinct({ personId: sql<number>`${payments.personId}` })
        .from(payments)
        .innerJoin(
          sql`"Appointment"`,
          sql`"Payment"."id" = "Appointment"."payment_id" AND "Appointment"."doctor_id" IN (SELECT "id" FROM "Doctor" WHERE "user_id" = ${userId})`
        );

      const personIds = assignedPersonIds.map((p) => p.personId);
      if (personIds.length > 0) {
        conditions.push(sql`${payments.personId} IN (${sql.join(personIds, sql`, `)})`);
      } else {
        // No assigned patients, return empty result
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: calculatePaginationMetadata(page, limit, 0),
          },
          { status: StatusCodes.OK }
        );
      }
    }
    // Admin sees all payments (no additional condition)

    // Additional filters
    if (queryParams.personId) {
      conditions.push(eq(payments.personId, queryParams.personId));
    }

    if (queryParams.startDate) {
      conditions.push(gte(payments.date, queryParams.startDate));
    }

    if (queryParams.endDate) {
      conditions.push(lte(payments.date, queryParams.endDate));
    }

    if (queryParams.minAmount !== undefined) {
      conditions.push(gte(payments.amount, String(queryParams.minAmount)));
    }

    if (queryParams.maxAmount !== undefined) {
      conditions.push(lte(payments.amount, String(queryParams.maxAmount)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countQuery = db.select({ count: count() }).from(payments);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated payments with related data
    const paymentsList = await db
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
      .where(whereClause)
      .orderBy(payments.date)
      .limit(limit)
      .offset(offset);

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json(
      {
        success: true,
        data: paymentsList,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching payments:", error);
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
 * POST /api/payments
 * Create a payment record
 * Access:
 * - Patient: Own payments only (e.g., after Stripe webhook confirmation)
 * - Admin: Can create payments for any person
 *
 * Note: Payments are typically created automatically when booking an appointment
 * or after payment gateway webhook confirms payment
 */
export async function POST(request: NextRequest) {
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

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createPaymentSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  // Authorization - check if user can create payment for this person
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "payment",
    "create",
    validatedData.personId
  );
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Verify person exists
    const person = await db.query.persons.findFirst({
      where: eq(persons.id, validatedData.personId),
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

    // For patients, verify they're creating payment for themselves
    if (role === "patient") {
      const currentPerson = await db.query.persons.findFirst({
        where: eq(persons.userId, userId),
      });

      if (!currentPerson || currentPerson.id !== validatedData.personId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "You can only create payments for yourself",
              code: "FORBIDDEN",
            },
          },
          { status: StatusCodes.FORBIDDEN }
        );
      }
    }

    // Verify payment method exists
    const paymentMethod = await db.query.paymentMethods.findFirst({
      where: eq(paymentMethods.id, validatedData.paymentMethodId),
    });

    if (!paymentMethod) {
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

    // Create the payment
    const [newPayment] = await db
      .insert(payments)
      .values({
        personId: validatedData.personId,
        paymentMethodId: validatedData.paymentMethodId,
        amount: validatedData.amount,
        date: validatedData.date,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: newPayment,
        message: "Payment created successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating payment:", error);
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
