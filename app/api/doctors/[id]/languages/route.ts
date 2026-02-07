import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams } from "@/utils/api/pagination/paginate";
import { addDoctorLanguageSchema } from "@/lib/api/schemas/doctor.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import {
  findDoctorById,
  findDoctorLanguages,
  findDoctorLanguage,
  createDoctorLanguage,
  findLanguageById
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/doctors/[id]/languages
 * List all languages spoken by a doctor with type (native/foreign)
 * Access:
 * - Patient: All languages (public for active doctors)
 * - Doctor: Own languages only
 * - Admin: All languages
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

    // Get paginated languages for this doctor with type
    const { data: doctorLanguagesList, pagination } = await findDoctorLanguages(doctorId, { page, limit, offset });

    return NextResponse.json(
      {
        success: true,
        data: doctorLanguagesList,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching doctor languages:", error);
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
 * POST /api/doctors/[id]/languages
 * Add a language to a doctor with type (native/foreign)
 * Access:
 * - Doctor: Own languages only
 * - Admin: All languages
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
    "doctor-language",
    "create",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, addDoctorLanguageSchema);
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

    // Verify language exists
    const language = await findLanguageById(validatedData.languageId);

    if (!language) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Language not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Check if language is already associated with this doctor
    const existingDoctorLanguage = await findDoctorLanguage(doctorId, validatedData.languageId);

    if (existingDoctorLanguage) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Language already associated with this doctor",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Create doctor-language association with type
    const doctorLanguage = await createDoctorLanguage(doctorId, validatedData.languageId, validatedData.type);

    return NextResponse.json(
      {
        success: true,
        data: doctorLanguage,
        message: "Language added successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error adding language:", error);
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
