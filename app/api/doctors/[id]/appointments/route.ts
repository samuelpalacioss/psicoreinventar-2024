import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateParams, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { appointments } from "@/src/db/schema";
import { and, count, eq } from "drizzle-orm";
import { findDoctorById } from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const listDoctorAppointmentsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]).optional(),
});

/**
 * GET /api/doctors/[id]/appointments
 * List all appointments for a doctor (read-only view)
 * Access:
 * - Doctor: Own appointments only
 * - Admin: All appointments
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
  const queryValidationResult = validateSearchParams(request.nextUrl.searchParams, listDoctorAppointmentsSchema);
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
    const conditions = [eq(appointments.doctorId, doctorId)];

    // Filter by status if provided
    if (queryParams.status) {
      conditions.push(eq(appointments.status, queryParams.status));
    }

    const whereClause = and(...conditions);

    // Get total count
    const countQuery = db.select({ count: count() }).from(appointments);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated appointments with relations
    const doctorAppointments = await db.query.appointments.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (appointments, { desc }) => [desc(appointments.startDateTime)],
      with: {
        person: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
        doctorService: {
          with: {
            service: true,
          },
        },
        payment: true,
      },
    });

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json(
      {
        success: true,
        data: doctorAppointments,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
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
