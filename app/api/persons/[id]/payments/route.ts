import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateParams, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema, paginationSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/src/types";
import { findPersonById, findPatientPayments } from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import { getPaginationParams } from "@/utils/api/pagination/paginate";

/**
 * GET /api/persons/[id]/payments
 * List all payments for a person (read-only)
 * Access:
 * - Patient: Own payments only
 * - Doctor: Assigned patients' payments
 * - Admin: All payments
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

  const personId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to parent person
  const authzResult = await checkResourceAccess(userId, role as Role, "person", "read", personId);
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, paginationSchema);
  if (!validationResult.success) return validationResult.error;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Verify person exists
    const person = await findPersonById(personId);

    if (!person) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Person not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Get paginated payments with payment method details
    const result = await findPatientPayments(personId, { page, limit, offset });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching person payments:", error);
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
