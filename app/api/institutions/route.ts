import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams } from "@/utils/api/pagination/paginate";
import { createInstitutionSchema, listInstitutionsSchema } from "@/lib/api/schemas/simple.schemas";
import { Role } from "@/src/types";
import { findAllInstitutions, findInstitutionByNameAndType, createInstitution } from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/institutions
 * List all institutions with pagination and search
 * Public access (no auth required for reading)
 */

export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const validationResult = validateSearchParams(
    request.nextUrl.searchParams,
    listInstitutionsSchema
  );
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  const pagination = getPaginationParams(request.nextUrl.searchParams);

  try {
    const result = await findAllInstitutions(
      {
        search: params.search,
        type: params.type,
        placeId: params.placeId,
        isVerified: params.isVerified,
      },
      pagination
    );

    return NextResponse.json({ success: true, ...result }, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * POST /api/institutions
 * Create a new institution
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
  const authzResult = await checkResourceAccess(userId, role as Role, "institution", "create");
  if (!authzResult.allowed) return authzResult.error;

  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createInstitutionSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    const existing = await findInstitutionByNameAndType(validatedData.name, validatedData.type);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Institution with this name and type already exists",
            code: "DUPLICATE_ENTRY",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Doctors create unverified institutions, admins can create verified
    const isVerified = role === Role.ADMIN && validatedData.isVerified === true;

    const institution = await createInstitution({
      ...validatedData,
      isVerified,
    });

    return NextResponse.json(
      {
        success: true,
        data: institution,
        message: isVerified
          ? "Institution created successfully"
          : "Institution created and pending verification",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating institution:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
