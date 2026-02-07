import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams } from "@/utils/api/pagination/paginate";
import { createScheduleSchema } from "@/lib/api/schemas/doctor.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import { findDoctorById, findDoctorSchedules, createDoctorSchedule } from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/doctors/[id]/schedules
 * List all schedule records (availability) for a doctor
 * Access:
 * - Patient: All schedules (public for active doctors)
 * - Doctor: Own schedules only
 * - Admin: All schedules
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

    // Get paginated schedules for this doctor
    const { data: doctorSchedules, pagination } = await findDoctorSchedules(doctorId, { page, limit, offset });

    return NextResponse.json(
      {
        success: true,
        data: doctorSchedules,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching doctor schedules:", error);
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
 * POST /api/doctors/[id]/schedules
 * Add a schedule (availability) record to a doctor
 * Access:
 * - Doctor: Own schedules only
 * - Admin: All schedules
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

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "schedule",
    "create",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createScheduleSchema);
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

    // Create schedule record
    const schedule = await createDoctorSchedule(doctorId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: schedule,
        message: "Schedule added successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error adding schedule:", error);
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
