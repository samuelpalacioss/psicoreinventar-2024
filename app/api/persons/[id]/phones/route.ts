import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams } from "@/utils/api/pagination/paginate";
import { personPhoneSchema } from "@/lib/api/schemas/person.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/src/types";
import { findPersonById, findPersonPhones, createPersonPhone } from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/persons/[id]/phones
 * List all phone numbers for a person
 * Access:
 * - Patient: Own phones only
 * - Doctor: Assigned patients' phones
 * - Admin: All phones
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

    // Get paginated phones for this person
    const result = await findPersonPhones(personId, { page, limit, offset });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching person phones:", error);
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
 * POST /api/persons/[id]/phones
 * Add a phone number to a person
 * Access:
 * - Patient: Own phones only
 * - Admin: All phones
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to parent person
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "phone",
    "create",
    undefined,
    { personId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, personPhoneSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

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

    // Create phone
    const phone = await createPersonPhone(personId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: phone,
        message: "Phone added successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error adding phone:", error);
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
