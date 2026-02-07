import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { listPaymentsSchema, createPaymentSchema } from "@/lib/api/schemas/payment.schemas";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { Role } from "@/src/types";
import db from "@/src/db";
import { paymentMethods, payoutMethods } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {
  findPersonByUserId,
  findDoctorByUserId,
  findDoctorAssignedPatientIdsFromPayments,
  findAllPayments,
  findPersonById,
  createPayment,
} from "@/src/dal";
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
    // Build filters
    const filters = {
      personId: queryParams.personId,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate,
      minAmount: queryParams.minAmount,
      maxAmount: queryParams.maxAmount,
    };

    // Role-based filtering
    if (role === "patient") {
      const person = await findPersonByUserId(userId);

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

      filters.personId = person.id;
    } else if (role === "doctor") {
      const doctor = await findDoctorByUserId(userId);

      if (!doctor) {
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: calculatePaginationMetadata(page, limit, 0),
          },
          { status: StatusCodes.OK }
        );
      }

      const personIds = await findDoctorAssignedPatientIdsFromPayments(doctor.id);

      const result = await findAllPayments(filters, { page, limit, offset }, personIds);

      return NextResponse.json(
        {
          success: true,
          ...result,
        },
        { status: StatusCodes.OK }
      );
    }
    // Admin sees all payments (no additional filter)

    const result = await findAllPayments(filters, { page, limit, offset });

    return NextResponse.json(
      {
        success: true,
        ...result,
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
    const person = await findPersonById(validatedData.personId);

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
      const currentPerson = await findPersonByUserId(userId);

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

    // Verify payout method exists
    const payoutMethod = await db.query.payoutMethods.findFirst({
      where: eq(payoutMethods.id, validatedData.payoutMethodId),
    });

    if (!payoutMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payout method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Create the payment
    const newPayment = await createPayment({
      personId: validatedData.personId,
      paymentMethodId: validatedData.paymentMethodId,
      payoutMethodId: validatedData.payoutMethodId,
      amount: validatedData.amount.toFixed(2),
      date: validatedData.date,
    });

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
