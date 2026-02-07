import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { Role } from "@/src/types";
import db from "@/src/db";
import { payoutMethods } from "@/src/db/schema";
import { and, count, eq } from "drizzle-orm";
import { findDoctorById, createDoctorPayoutMethod } from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import { listDoctorPayoutsSchema, createPayoutMethodSchema } from "@/lib/api/schemas/doctor.schemas";

/**
 * GET /api/doctors/[id]/payout-methods
 * List all payout methods for a doctor (saved bank accounts/pago movil)
 * Access:
 * - Doctor: Own payout methods only
 * - Admin: All payout methods
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

  const doctorId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(userId, role as Role, "doctor", "read", doctorId);
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const queryValidationResult = validateSearchParams(
    request.nextUrl.searchParams,
    listDoctorPayoutsSchema
  );
  if (!queryValidationResult.success) return queryValidationResult.error;
  const queryParams = queryValidationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Verify doctor exists
    const doctor = await findDoctorById(doctorId);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctor not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Build WHERE clause
    const conditions = [eq(payoutMethods.doctorId, doctorId)];

    // Filter by type if provided
    if (queryParams.type) {
      conditions.push(eq(payoutMethods.type, queryParams.type));
    }

    const whereClause = and(...conditions);

    // Get total count
    const countQuery = db.select({ count: count() }).from(payoutMethods);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated payout methods
    const doctorPayoutMethods = await db.query.payoutMethods.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (payoutMethods, { desc }) => [desc(payoutMethods.createdAt)],
    });

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json(
      {
        success: true,
        data: doctorPayoutMethods,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching doctor payout methods:", error);
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
 * POST /api/doctors/[id]/payout-methods
 * Create a new payout method for a doctor (bank account or pago móvil)
 * Access:
 * - Doctor: Own payout methods only
 * - Admin: All doctors
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to create payout methods for this doctor
  const authzResult = await checkResourceAccess(userId, role as Role, "payout-method", "create", doctorId);
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createPayoutMethodSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Verify doctor exists
    const doctor = await findDoctorById(doctorId);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctor not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Create the payout method (DAL handles preferred logic)
    const newPayoutMethod = await createDoctorPayoutMethod(doctorId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: newPayoutMethod,
        message: "Payout method created successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating payout method:", error);
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
