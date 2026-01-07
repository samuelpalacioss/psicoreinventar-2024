import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import { listReviewsSchema } from "@/lib/api/schemas/review.schemas";
import db from "@/src/db";
import { reviews } from "@/src/db/schema";
import { and, count, eq, gte, lte } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/reviews
 * List all reviews with pagination and filters
 * Access:
 * - Public (anyone can read reviews)
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication (optional for public endpoint, but check if available)
  const session = await getAuthSession(request);

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, listReviewsSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Build WHERE clause with filters
    const conditions = [];

    // Filter by doctorId
    if (params.doctorId) {
      conditions.push(eq(reviews.doctorId, params.doctorId));
    }

    // Filter by personId
    if (params.personId) {
      conditions.push(eq(reviews.personId, params.personId));
    }

    // Filter by minimum score
    if (params.minScore) {
      conditions.push(gte(reviews.score, params.minScore));
    }

    // Filter by maximum score
    if (params.maxScore) {
      conditions.push(lte(reviews.score, params.maxScore));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countQuery = db.select({ count: count() }).from(reviews);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated data with relations
    const data = await db.query.reviews.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      with: {
        doctor: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
        person: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
      },
    });

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
    console.error("Error fetching reviews:", error);
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
