import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { createPersonSchema, listPersonsSchema } from "@/lib/api/schemas/person.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { persons, places, appointments } from "@/src/db/schema";
import { and, count, eq, ilike, or, sql } from "drizzle-orm";
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
  const authzResult = await checkResourceAccess(userId, role as Role, "person", "list");
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, listPersonsSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Build WHERE clause with role-based filtering
    const conditions = [];

    // Role-based filtering
    if (role === Role.PATIENT) {
      // Patients see only their own record
      conditions.push(eq(persons.userId, userId));
    } else if (role === Role.DOCTOR) {
      // Doctors see assigned patients (patients with appointments)
      const doctor = await db.query.doctors.findFirst({
        where: (doctors, { eq }) => eq(doctors.userId, userId),
      });

      if (doctor) {
        // Get all person IDs that have appointments with this doctor
        const assignedPersonIds = await db
          .selectDistinct({ personId: appointments.personId })
          .from(appointments)
          .where(eq(appointments.doctorId, doctor.id));

        if (assignedPersonIds.length > 0) {
          const personIds = assignedPersonIds.map((a) => a.personId);
          conditions.push(sql`${persons.id} IN (${sql.join(personIds, sql.raw(","))})`);
        } else {
          // Doctor has no assigned patients yet - return empty result
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
      } else {
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
    }
    // Admin sees all (no additional filter)

    // Additional filters from params
    if (params.search) {
      conditions.push(
        or(
          ilike(persons.firstName, `%${params.search}%`),
          ilike(persons.firstLastName, `%${params.search}%`),
          ilike(persons.middleName, `%${params.search}%`),
          ilike(persons.secondLastName, `%${params.search}%`)
        )
      );
    }

    if (params.placeId) {
      conditions.push(eq(persons.placeId, params.placeId));
    }

    if (params.isActive !== undefined) {
      conditions.push(eq(persons.isActive, params.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countQuery = db.select({ count: count() }).from(persons);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated data with relations
    const dataQuery = db
      .select({
        id: persons.id,
        userId: persons.userId,
        ci: persons.ci,
        firstName: persons.firstName,
        middleName: persons.middleName,
        firstLastName: persons.firstLastName,
        secondLastName: persons.secondLastName,
        birthDate: persons.birthDate,
        address: persons.address,
        placeId: persons.placeId,
        isActive: persons.isActive,
        createdAt: persons.createdAt,
        updatedAt: persons.updatedAt,
        place: {
          id: places.id,
          name: places.name,
        },
      })
      .from(persons)
      .leftJoin(places, eq(persons.placeId, places.id))
      .limit(limit)
      .offset(offset);

    if (whereClause) {
      dataQuery.where(whereClause);
    }

    const data = await dataQuery;

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json(
      {
        success: true,
        data,
        pagination,
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
  const authzResult = await checkResourceAccess(userId, role as Role, "person", "create");
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createPersonSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if user already has a person profile
    const existingPerson = await db.query.persons.findFirst({
      where: eq(persons.userId, userId),
    });

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
    const existingCI = await db.query.persons.findFirst({
      where: eq(persons.ci, validatedData.ci),
    });

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
    const place = await db.query.places.findFirst({
      where: eq(places.id, validatedData.placeId),
    });

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
    const [person] = await db
      .insert(persons)
      .values({
        ...validatedData,
        userId,
      })
      .returning();

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
