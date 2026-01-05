import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { createServiceSchema, listServicesSchema } from "@/lib/api/schemas/simple.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { services } from "@/src/db/schema";
import { and, count, ilike, or } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/services
 * List all services with pagination and search
 * Public access (no auth required for reading)
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, listServicesSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Build WHERE clause
    const conditions = [];
    if (params.search) {
      conditions.push(
        or(
          ilike(services.name, `%${params.search}%`),
          ilike(services.description, `%${params.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countQuery = db.select({ count: count() }).from(services);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated data
    const dataQuery = db.select().from(services).limit(limit).offset(offset);
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
    console.error("Error fetching services:", error);
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
 * POST /api/services
 * Create a new service
 * Admin only
 */
export async function POST(request: NextRequest) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication
  const session = await getServerSession();
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

  // Authorization (admin only)
  const authzResult = await checkResourceAccess(userId, role as Role, "service", "create");
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createServiceSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check for duplicate name
    const existing = await db.query.services.findFirst({
      where: ilike(services.name, validatedData.name),
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Service with this name already exists",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Create service
    // .returning() returns an array of inserted rows, we destructure to get the first element
    const [service] = await db.insert(services).values(validatedData).returning();

    return NextResponse.json(
      {
        success: true,
        data: service,
        message: "Service created successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating service:", error);
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
