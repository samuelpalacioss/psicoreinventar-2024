import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams } from "@/utils/api/pagination/paginate";
import { createProgressSchema, listProgressSchema } from "@/lib/api/schemas/progress.schemas";
import { Role } from "@/src/types";
import {
  findPersonByUserId,
  findDoctorByUserId,
  findAllProgresses,
  findPersonById,
  findAppointmentForProgress,
  createProgress,
  findProgressById,
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/progresses
 * List progress records with pagination and filters
 * Access:
 * - Patient: Own progress records only
 * - Doctor: Progress records for assigned patients
 * - Admin: No access (sensitive data)
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
  const authzResult = await checkResourceAccess(userId, role, "progress", "list");
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, listProgressSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Build filters with role-based filtering
    const filters: {
      personId?: number;
      doctorId?: number;
      appointmentId?: number;
      conditionId?: number;
    } = {
      personId: params.personId,
      doctorId: params.doctorId,
      appointmentId: params.appointmentId,
      conditionId: params.conditionId,
    };

    // Role-based filtering
    if (role === Role.PATIENT) {
      const person = await findPersonByUserId(userId);

      if (!person) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Patient profile not found",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }

      filters.personId = person.id;
    } else if (role === Role.DOCTOR) {
      const doctor = await findDoctorByUserId(userId);

      if (!doctor) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Doctor profile not found",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }

      filters.doctorId = doctor.id;
    }
    // Admin has no access (already checked in authorization)

    const result = await findAllProgresses(filters, { page, limit, offset });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching progress records:", error);
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
 * POST /api/progresses
 * Create a new progress record
 * Access:
 * - Doctor: Can create progress for assigned patients only
 * - Patient: No permission
 * - Admin: No permission
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

  // Only doctors can create progress records
  if (role !== Role.DOCTOR) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Only doctors can create progress records",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createProgressSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  // Authorization - check if doctor is assigned to this patient
  const authzResult = await checkResourceAccess(userId, role, "progress", "create", undefined, {
    personId: validatedData.personId,
  });
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Get doctor record
    const doctor = await findDoctorByUserId(userId);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctor profile not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Verify person exists
    const person = await findPersonById(validatedData.personId);

    if (!person) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Patient not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // If appointmentId is provided, verify it exists and belongs to the patient and doctor
    if (validatedData.appointmentId) {
      const appointment = await findAppointmentForProgress(
        validatedData.appointmentId,
        validatedData.personId,
        doctor.id
      );

      if (!appointment) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Appointment not found or does not belong to this patient and doctor",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }
    }

    // Create progress record
    const progress = await createProgress({
      personId: validatedData.personId,
      doctorId: doctor.id,
      appointmentId: validatedData.appointmentId || null,
      conditionId: validatedData.conditionId || null,
      title: validatedData.title,
      level: validatedData.level || null,
      notes: validatedData.notes || null,
    });

    // Fetch complete progress data with relations
    const completeProgress = await findProgressById(progress.id);

    return NextResponse.json(
      {
        success: true,
        data: completeProgress,
        message: "Progress record created successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating progress record:", error);
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
