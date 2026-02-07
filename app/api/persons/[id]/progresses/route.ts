import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import {
  validateParams,
  validateSearchParams,
  validateBody,
} from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema, paginationSchema } from "@/lib/api/schemas/common.schemas";
import { createProgressSchema } from "@/lib/api/schemas/simple.schemas";
import { Role } from "@/src/types";
import {
  findPersonById,
  findPatientProgresses,
  findDoctorByUserId,
  findAppointmentForProgress,
  createProgress,
  findProgressById,
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import { getPaginationParams } from "@/utils/api/pagination/paginate";

/**
 * GET /api/persons/[id]/progresses
 * List all progress records for a person (read-only)
 * Access:
 * - Patient: Own progress records only
 * - Doctor: Assigned patients' progress records
 * - Admin: No progress records (as is sensitive data)
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
  const authzResult = await checkResourceAccess(userId, role, "person", "read", personId);
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, paginationSchema);
  if (!validationResult.success) return validationResult.error;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Verify person exists
    const person = await findPersonById(personId);

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

    // Get paginated progress records
    const result = await findPatientProgresses(personId, { page, limit, offset });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching person progress records:", error);
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
 * POST /api/persons/[id]/progresses
 * Create a new progress record for a person
 * Access:
 * - Patient: Cannot create progress records (doctors create them)
 * - Doctor: Can create progress records for assigned patients
 * - Admin: Cannot create progress records (as is sensitive data)
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

  const personId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to create progress for this person
  const authzResult = await checkResourceAccess(userId, role, "progress", "create", undefined, {
    personId,
  });
  if (!authzResult.allowed) return authzResult.error;

  // Get doctor record if requester is a doctor (required for creating progress)
  let doctorId: number | undefined;
  if (role === Role.DOCTOR) {
    const doctor = await findDoctorByUserId(userId);
    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctor record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }
    doctorId = doctor.id;
  } else {
    // Only doctors can create progress records
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
  // Remove personId from schema validation since it comes from params
  const progressSchemaWithoutPersonId = createProgressSchema.omit({ personId: true });
  const bodyValidationResult = validateBody(body, progressSchemaWithoutPersonId);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Verify person exists
    const person = await findPersonById(personId);

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

    // If appointmentId is provided, verify it belongs to this person and this doctor
    if (validatedData.appointmentId) {
      const appointment = await findAppointmentForProgress(
        validatedData.appointmentId,
        personId,
        doctorId
      );

      if (!appointment) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Appointment not found or does not belong to this person/doctor",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }
    }

    // Create progress record with doctorId
    const progress = await createProgress({
      ...validatedData,
      personId,
      doctorId,
    });

    // Fetch the created progress with related data
    const progressWithRelations = await findProgressById(progress.id);

    return NextResponse.json(
      {
        success: true,
        data: progressWithRelations,
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
