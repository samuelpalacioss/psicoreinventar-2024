import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { createDoctorSchema, listDoctorsSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/src/types";
import {
  findAllDoctors,
  findDoctorByUserId,
  findDoctorByCi,
  findPlaceById,
  createDoctor,
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/doctors
 * Browse doctors with filters (public for discovery, role-based for management)
 * Access:
 * - Unauthenticated: Active doctors only (public browsing)
 * - Patient: All active doctors (public browsing)
 * - Doctor: Own profile
 * - Admin: All doctors (including inactive)
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication (optional for public browsing)
  const session = await getAuthSession(request);
  const userId = session?.user?.id;
  const role = session?.user?.role;

  // Authorization - only check if authenticated
  if (session?.user) {
    const authzResult = await checkResourceAccess(userId!, role!, "doctor", "list");
    if (!authzResult.allowed) return authzResult.error;
  }

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, listDoctorsSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Build filters based on role and params
    const filters: Record<string, any> = {
      search: params.search,
      placeId: params.placeId,
      isActive: params.isActive,
      serviceId: params.serviceId,
      conditionId: params.conditionId,
      languageId: params.languageId,
      treatmentMethodId: params.treatmentMethodId,
      consultationType: params.consultationType,
    };

    let restrictToIds: number[] | undefined = undefined;

    // Role-based filtering
    if (!session?.user || role === Role.PATIENT) {
      // Unauthenticated users and patients see only active doctors (public browsing)
      filters.isActive = true;
    } else if (role === Role.DOCTOR) {
      // Doctors see only their own profile
      const doctor = await findDoctorByUserId(userId!);

      if (!doctor) {
        // User is doctor role but has no doctor profile - return empty result
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: calculatePaginationMetadata(page, limit, 0),
          },
          { status: StatusCodes.OK }
        );
      }

      restrictToIds = [doctor.id];
    }
    // Admin sees all (no additional filter)

    // Check for lightweight mode (for public listing pages)
    const isLiteMode = request.nextUrl.searchParams.get('lite') === 'true';

    // Get doctors using DAL with optional column selection
    const result = await findAllDoctors(filters, { page, limit, offset }, restrictToIds, {
      columns: isLiteMode ? {
        id: true,
        firstName: true,
        middleName: true,
        firstLastName: true,
        secondLastName: true,
        practiceStartYear: true,
        biography: true,
      } : undefined, // undefined = all columns
      includePlace: true,
      includeStats: true,
      includeConditions: true,
    });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching doctors:", error);
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
 * POST /api/doctors
 * Create a new doctor profile (requires admin approval)
 * Access:
 * - Doctor: Create own profile (userId from session)
 * - Admin: Create profile for any user
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

  // Authorization
  const authzResult = await checkResourceAccess(userId, role, "doctor", "create");
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createDoctorSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if user already has a doctor profile
    const existingDoctor = await findDoctorByUserId(userId);

    if (existingDoctor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "User already has a doctor profile",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Check if CI is already in use
    const existingCI = await findDoctorByCi(validatedData.ci);

    if (existingCI) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "CI already exists",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Verify place exists if provided
    if (validatedData.placeId !== undefined) {
      const place = await findPlaceById(validatedData.placeId);

      if (!place) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Place not found",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }
    }

    // Create doctor profile (isActive defaults to false - requires admin approval)
    const doctor = await createDoctor({
      ...validatedData,
      userId,
      isActive: false, // Requires admin approval
    });

    return NextResponse.json(
      {
        success: true,
        data: doctor,
        message: "Doctor profile created successfully. Awaiting admin approval.",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating doctor:", error);
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
