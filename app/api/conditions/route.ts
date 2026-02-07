import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams } from "@/utils/api/pagination/paginate";
import { createConditionSchema, listConditionsSchema } from "@/lib/api/schemas/simple.schemas";
import { Role } from "@/src/types";
import { findAllConditions, findConditionByName, createCondition } from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/conditions
 * List all conditions with pagination and search
 * Public access
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const validationResult = validateSearchParams(request.nextUrl.searchParams, listConditionsSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  const pagination = getPaginationParams(request.nextUrl.searchParams);

  try {
    const result = await findAllConditions({ search: params.search }, pagination);

    return NextResponse.json({ success: true, ...result }, { status: StatusCodes.OK });
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
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

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

  const authzResult = await checkResourceAccess(userId, role, "condition", "create");
  if (!authzResult.allowed) return authzResult.error;

  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createConditionSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    const existing = await findConditionByName(validatedData.name);

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

    const condition = await createCondition(validatedData);

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
