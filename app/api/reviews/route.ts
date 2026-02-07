import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams } from "@/utils/api/pagination/paginate";
import { listReviewsSchema } from "@/lib/api/schemas/review.schemas";
import { findAllReviews } from "@/src/dal";
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
    const result = await findAllReviews(
      {
        doctorId: params.doctorId,
        personId: params.personId,
        minScore: params.minScore,
        maxScore: params.maxScore,
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
