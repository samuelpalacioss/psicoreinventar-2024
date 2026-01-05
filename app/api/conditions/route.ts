import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { createConditionSchema, listConditionsSchema } from "@/lib/api/schemas/simple.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { conditions } from "@/src/db/schema";
import { and, count, ilike } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/conditions
 * List all conditions with pagination and search
 * Public access
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, listConditionsSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Build WHERE clause
    const conditions_array = [];
    if (params.search) {
      conditions_array.push(ilike(conditions.name, `%${params.search}%`));
    }

    const whereClause = conditions_array.length > 0 ? and(...conditions_array) : undefined;

    // Get total count
    const countQuery = db.select({ count: count() }).from(conditions);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated data
    const dataQuery = db.select().from(conditions).limit(limit).offset(offset);
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
    console.error("Error fetching conditions:", error);
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
 * POST /api/conditions
 * Create a new condition
 * Admin only
 */
export async function POST(request: NextRequest) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication (supports dev token in development mode)
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

  // Authorization (admin only)
  const authzResult = await checkResourceAccess(userId, role as Role, "condition", "create");
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createConditionSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check for duplicate name
    const existing = await db.query.conditions.findFirst({
      where: ilike(conditions.name, validatedData.name),
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Condition with this name already exists",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Create condition
    const [condition] = await db.insert(conditions).values(validatedData).returning();

    return NextResponse.json(
      {
        success: true,
        data: condition,
        message: "Condition created successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating condition:", error);
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
