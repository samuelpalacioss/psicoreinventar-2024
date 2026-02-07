import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams } from "@/utils/api/pagination/paginate";
import { addDoctorTreatmentMethodSchema } from "@/lib/api/schemas/doctor.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/src/types";
import {
  findDoctorById,
  findDoctorTreatmentMethods,
  findDoctorTreatmentMethod,
  createDoctorTreatmentMethod,
  findTreatmentMethodById
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/doctors/[id]/treatment-methods
 * List all treatment methods used by a doctor
 * Access:
 * - Patient: All treatment methods (public for active doctors)
 * - Doctor: Own treatment methods only
 * - Admin: All treatment methods
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

    // Get paginated treatment methods for this doctor
    const { data: doctorTreatmentMethodsList, pagination } = await findDoctorTreatmentMethods(doctorId, { page, limit, offset });

    return NextResponse.json(
      {
        success: true,
        data: doctorTreatmentMethodsList,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching doctor treatment methods:", error);
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
 * POST /api/doctors/[id]/treatment-methods
 * Add a treatment method to a doctor
 * Access:
 * - Doctor: Own treatment methods only
 * - Admin: All treatment methods
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
    "doctor-treatment-method",
    "create",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, addDoctorTreatmentMethodSchema);
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

    // Verify treatment method exists
    const treatmentMethod = await findTreatmentMethodById(validatedData.treatmentMethodId);

    if (!treatmentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Treatment method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Check if treatment method is already associated with this doctor
    const existingDoctorTreatmentMethod = await findDoctorTreatmentMethod(doctorId, validatedData.treatmentMethodId);

    if (existingDoctorTreatmentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Treatment method already associated with this doctor",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Create doctor-treatment method association
    const doctorTreatmentMethod = await createDoctorTreatmentMethod(doctorId, validatedData.treatmentMethodId);

    return NextResponse.json(
      {
        success: true,
        data: doctorTreatmentMethod,
        message: "Treatment method added successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error adding treatment method:", error);
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
