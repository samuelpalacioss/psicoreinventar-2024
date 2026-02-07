import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateReviewSchema } from "@/lib/api/schemas/review.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import {
  findReviewById,
  findPersonByUserId,
  editReview,
  deleteReview,
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/reviews/[id]
 * Get a single review by ID
 * Access:
 * - Public (anyone can read reviews)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const reviewId = Number(paramsValidationResult.data.id);

  try {
    // Fetch review with relations
    const review = await findReviewById(reviewId);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Review not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: review,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching review:", error);
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
 * PATCH /api/reviews/[id]
 * Update a review
 * Access:
 * - Patient: Can update own reviews
 * - Admin: Can update any review (moderation)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const reviewId = Number(paramsValidationResult.data.id);

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

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateReviewSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if review exists
    const existingReview = await findReviewById(reviewId);

    if (!existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Review not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Authorization: patient can update own review, admin can update any
    if (role === Role.PATIENT) {
      // Get patient's person record
      const person = await findPersonByUserId(userId);

      if (!person || existingReview.personId !== person.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "You do not have permission to update this review",
              code: "FORBIDDEN",
            },
          },
          { status: StatusCodes.FORBIDDEN }
        );
      }
    } else if (role === Role.DOCTOR) {
      // Doctors cannot update reviews
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctors cannot update reviews",
            code: "FORBIDDEN",
          },
        },
        { status: StatusCodes.FORBIDDEN }
      );
    }
    // Admins can update any review (no additional check needed)

    // Update review
    await editReview(reviewId, validatedData);

    // Fetch complete review data with relations
    const completeReview = await findReviewById(reviewId);

    return NextResponse.json(
      {
        success: true,
        data: completeReview,
        message: "Review updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating review:", error);
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
 * DELETE /api/reviews/[id]
 * Delete a review
 * Access:
 * - Patient: Can delete own reviews
 * - Admin: Can delete any review (moderation)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const reviewId = Number(paramsValidationResult.data.id);

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

  try {
    // Check if review exists
    const existingReview = await findReviewById(reviewId);

    if (!existingReview) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Review not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Authorization: patient can delete own review, admin can delete any
    if (role === Role.PATIENT) {
      // Get patient's person record
      const person = await findPersonByUserId(userId);

      if (!person || existingReview.personId !== person.id) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "You do not have permission to delete this review",
              code: "FORBIDDEN",
            },
          },
          { status: StatusCodes.FORBIDDEN }
        );
      }
    } else if (role === Role.DOCTOR) {
      // Doctors cannot delete reviews
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctors cannot delete reviews",
            code: "FORBIDDEN",
          },
        },
        { status: StatusCodes.FORBIDDEN }
      );
    }
    // Admins can delete any review (no additional check needed)

    // Delete review
    await deleteReview(reviewId);

    return NextResponse.json(
      {
        success: true,
        message: "Review deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting review:", error);
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
