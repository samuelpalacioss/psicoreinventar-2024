import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { createDoctorSchema, listDoctorsSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import {
  doctors,
  places,
  doctorServices,
  doctorConditions,
  doctorLanguages,
  doctorTreatmentMethods,
} from "@/src/db/schema";
import { and, count, eq, ilike, or, sql } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/doctors
 * Browse doctors with filters (public for discovery, role-based for management)
 * Access:
 * - Patient: All active doctors (public browsing)
 * - Doctor: Own profile
 * - Admin: All doctors (including inactive)
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
  const authzResult = await checkResourceAccess(userId, role as Role, "doctor", "list");
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, listDoctorsSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Build WHERE clause with role-based filtering
    const conditions = [];

    // Role-based filtering
    if (role === Role.PATIENT) {
      // Patients see only active doctors (public browsing)
      conditions.push(eq(doctors.isActive, true));
    } else if (role === Role.DOCTOR) {
      // Doctors see only their own profile
      const doctor = await db.query.doctors.findFirst({
        where: (docs, { eq }) => eq(docs.userId, userId),
      });

      if (doctor) {
        conditions.push(eq(doctors.id, doctor.id));
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
          ilike(doctors.firstName, `%${params.search}%`),
          ilike(doctors.firstLastName, `%${params.search}%`),
          ilike(doctors.middleName, `%${params.search}%`),
          ilike(doctors.secondLastName, `%${params.search}%`),
          ilike(doctors.biography, `%${params.search}%`)
        )
      );
    }

    if (params.placeId) {
      conditions.push(eq(doctors.placeId, params.placeId));
    }

    if (params.isActive !== undefined) {
      conditions.push(eq(doctors.isActive, params.isActive));
    }

    // Filter by service
    if (params.serviceId) {
      const doctorIdsWithService = await db
        .selectDistinct({ doctorId: doctorServices.doctorId })
        .from(doctorServices)
        .where(eq(doctorServices.serviceId, params.serviceId));

      if (doctorIdsWithService.length > 0) {
        const doctorIds = doctorIdsWithService.map((ds) => ds.doctorId);
        conditions.push(sql`${doctors.id} IN (${sql.join(doctorIds, sql.raw(","))})`);
      } else {
        // No doctors with this service - return empty result
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

    // Filter by condition
    if (params.conditionId) {
      const doctorIdsWithCondition = await db
        .selectDistinct({ doctorId: doctorConditions.doctorId })
        .from(doctorConditions)
        .where(eq(doctorConditions.conditionId, params.conditionId));

      if (doctorIdsWithCondition.length > 0) {
        const doctorIds = doctorIdsWithCondition.map((dc) => dc.doctorId);
        conditions.push(sql`${doctors.id} IN (${sql.join(doctorIds, sql.raw(","))})`);
      } else {
        // No doctors with this condition - return empty result
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

    // Filter by language
    if (params.languageId) {
      const doctorIdsWithLanguage = await db
        .selectDistinct({ doctorId: doctorLanguages.doctorId })
        .from(doctorLanguages)
        .where(eq(doctorLanguages.languageId, params.languageId));

      if (doctorIdsWithLanguage.length > 0) {
        const doctorIds = doctorIdsWithLanguage.map((dl) => dl.doctorId);
        conditions.push(sql`${doctors.id} IN (${sql.join(doctorIds, sql.raw(","))})`);
      } else {
        // No doctors with this language - return empty result
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

    // Filter by treatment method
    if (params.treatmentMethodId) {
      const doctorIdsWithTreatmentMethod = await db
        .selectDistinct({ doctorId: doctorTreatmentMethods.doctorId })
        .from(doctorTreatmentMethods)
        .where(eq(doctorTreatmentMethods.treatmentMethodId, params.treatmentMethodId));

      if (doctorIdsWithTreatmentMethod.length > 0) {
        const doctorIds = doctorIdsWithTreatmentMethod.map((dtm) => dtm.doctorId);
        conditions.push(sql`${doctors.id} IN (${sql.join(doctorIds, sql.raw(","))})`);
      } else {
        // No doctors with this treatment method - return empty result
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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countQuery = db.select({ count: count() }).from(doctors);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated data with relations
    const dataQuery = db
      .select({
        id: doctors.id,
        userId: doctors.userId,
        ci: doctors.ci,
        firstName: doctors.firstName,
        middleName: doctors.middleName,
        firstLastName: doctors.firstLastName,
        secondLastName: doctors.secondLastName,
        birthDate: doctors.birthDate,
        address: doctors.address,
        placeId: doctors.placeId,
        biography: doctors.biography,
        firstSessionExpectation: doctors.firstSessionExpectation,
        biggestStrengths: doctors.biggestStrengths,
        isActive: doctors.isActive,
        createdAt: doctors.createdAt,
        updatedAt: doctors.updatedAt,
        place: {
          id: places.id,
          name: places.name,
        },
      })
      .from(doctors)
      .leftJoin(places, eq(doctors.placeId, places.id))
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
  const authzResult = await checkResourceAccess(userId, role as Role, "doctor", "create");
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createDoctorSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if user already has a doctor profile
    const existingDoctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
    });

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
    const existingCI = await db.query.doctors.findFirst({
      where: eq(doctors.ci, validatedData.ci),
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

    // Create doctor profile (isActive defaults to false - requires admin approval)
    const [doctor] = await db
      .insert(doctors)
      .values({
        ...validatedData,
        userId,
        isActive: false, // Requires admin approval
      })
      .returning();

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
