import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams } from "@/utils/api/pagination/paginate";
import { createPlaceSchema, listPlacesSchema } from "@/lib/api/schemas/simple.schemas";
import { Role } from "@/src/types";
import { findAllPlaces, findPlaceByNameAndType, createPlace } from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/places
 * List all places with pagination and search
 * Public access (no auth required for reading)
 */

export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const validationResult = validateSearchParams(request.nextUrl.searchParams, listPlacesSchema);
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  const pagination = getPaginationParams(request.nextUrl.searchParams);

  try {
    const result = await findAllPlaces(
      { search: params.search, type: params.type },
      pagination
    );

    return NextResponse.json({ success: true, ...result }, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error fetching places:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/places
 * Create a new place
 * Admin only
 */

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const session = await getAuthSession(request);
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
      { status: StatusCodes.UNAUTHORIZED }
    );
  }

  const { id: userId, role } = session.user;
  const authzResult = await checkResourceAccess(userId, role as Role, "place", "create");
  if (!authzResult.allowed) return authzResult.error;

  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createPlaceSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    const existing = await findPlaceByNameAndType(validatedData.name, validatedData.type);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Place with this name and type already exists",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    const place = await createPlace(validatedData);

    return NextResponse.json(
      { success: true, data: place, message: "Place created successfully" },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating place:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
