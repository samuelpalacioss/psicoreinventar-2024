import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { createPersonSchema, listPersonsSchema } from "@/lib/api/schemas/person.schemas";
import { Role } from "@/src/types";
import {
  findAllPersons,
  findPersonByUserId,
  findPersonByCi,
  findPlaceById,
  createPerson,
  findDoctorByUserId,
} from "@/src/dal";
import db from "@/src/db";
import { appointments } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/persons (clients, admins)
 * List all persons with pagination and filters
 * Access:
 * - Patient: Own records only
 * - Doctor: Assigned patients (via appointments)
 * - Admin: All records
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
  const authzResult = await checkResourceAccess(userId, role, "person", "list");
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, listPersonsSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Role-based filtering
    if (role === Role.PATIENT) {
      // Patients see only their own record
      const person = await findPersonByUserId(userId);
      if (!person) {
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: calculatePaginationMetadata(page, limit, 0),
          },
          { status: StatusCodes.OK }
        );
      }

      // Return single-item result
      return NextResponse.json(
        {
          success: true,
          data: [person],
          pagination: calculatePaginationMetadata(page, limit, 1),
        },
        { status: StatusCodes.OK }
      );
    } else if (role === Role.DOCTOR) {
      // Doctors see assigned patients (patients with appointments)
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

      // Get all person IDs that have appointments with this doctor
      const assignedPersonIds = await db
        .selectDistinct({ personId: appointments.personId })
        .from(appointments)
        .where(eq(appointments.doctorId, doctor.id));

      if (assignedPersonIds.length === 0) {
        return NextResponse.json(
          {
            success: true,
            data: [],
            message: "No patients assigned to this doctor",
            pagination: calculatePaginationMetadata(page, limit, 0),
          },
          { status: StatusCodes.OK }
        );
      }

      // Use findAllPersons with restrictToIds (pass IDs as filter)
      // Since findAllPersons doesn't support restrictToIds, we keep db query for this case
      const result = await findAllPersons(
        {
          search: params.search,
          placeId: params.placeId,
          isActive: params.isActive,
        },
        { page, limit, offset }
      );

      // Filter to only assigned patients (DAL doesn't support restrictToIds for persons)
      const personIds = new Set(assignedPersonIds.map((a) => a.personId));
      const filteredData = result.data.filter((p) => personIds.has(p.id));

      return NextResponse.json(
        {
          success: true,
          data: filteredData,
          pagination: result.pagination,
        },
        { status: StatusCodes.OK }
      );
    }

    // Admin sees all
    const result = await findAllPersons(
      {
        search: params.search,
        placeId: params.placeId,
        isActive: params.isActive,
      },
      { page, limit, offset }
    );

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching persons:", error);
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
 * POST /api/persons
 * Create a new person profile
 * Access:
 * - Patient: Create own profile (userId from session)
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
  const authzResult = await checkResourceAccess(userId, role, "person", "create");
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createPersonSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if user already has a person profile
    const existingPerson = await findPersonByUserId(userId);

    if (existingPerson) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "User already has a person profile",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Check if CI is already in use
    const existingCI = await findPersonByCi(validatedData.ci);

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

    // Verify place exists
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

    // Create person profile
    const person = await createPerson({
      ...validatedData,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: person,
        message: "Person profile created successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating person:", error);
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
