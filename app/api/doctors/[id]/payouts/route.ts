import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateParams, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { doctors, payouts } from "@/src/db/schema";
import { and, count, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const listDoctorPayoutsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
});

/**
 * GET /api/doctors/[id]/payouts
 * List all payouts for a doctor (read-only view)
 * Access:
 * - Doctor: Own payouts only
 * - Admin: All payouts
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
  const queryValidationResult = validateSearchParams(request.nextUrl.searchParams, listDoctorPayoutsSchema);
  if (!queryValidationResult.success) return queryValidationResult.error;
  const queryParams = queryValidationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Verify doctor exists
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.id, doctorId),
    });

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
    const conditions = [eq(payouts.doctorId, doctorId)];

    // Filter by status if provided
    if (queryParams.status) {
      conditions.push(eq(payouts.status, queryParams.status));
    }

    const whereClause = and(...conditions);

    // Get total count
    const countQuery = db.select({ count: count() }).from(payouts);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated payouts
    const doctorPayouts = await db.query.payouts.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (payouts, { desc }) => [desc(payouts.createdAt)],
    });

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json(
      {
        success: true,
        data: doctorPayouts,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching doctor payouts:", error);
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

