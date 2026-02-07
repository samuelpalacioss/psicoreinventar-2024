import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { personPhoneSchema } from "@/lib/api/schemas/person.schemas";
import { Role } from "@/src/types";
import { findPersonPhone, editPersonPhone, deletePersonPhone } from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const phoneParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid person ID"),
  phoneId: z.string().regex(/^\d+$/, "Invalid phone ID"),
});

/**
 * GET /api/persons/[id]/phones/[phoneId]
 * Get a specific phone number
 * Access:
 * - Patient: Own phones only
 * - Doctor: Assigned patients' phones
 * - Admin: All phones
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phoneId: string }> }
) {
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

  // Validate parameters
  const paramsValidationResult = validateParams(resolvedParams, phoneParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = parseInt(paramsValidationResult.data.id);
  const phoneId = parseInt(paramsValidationResult.data.phoneId);

  // Authorization - check access to phone
  const authzResult = await checkResourceAccess(userId, role, "phone", "read", phoneId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Fetch phone and verify it belongs to the person
    const phone = await findPersonPhone(personId, phoneId);

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Phone not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: phone,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching phone:", error);
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
 * PATCH /api/persons/[id]/phones/[phoneId]
 * Update a phone number
 * Access:
 * - Patient: Own phones only
 * - Admin: All phones
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phoneId: string }> }
) {
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

  // Validate parameters
  const paramsValidationResult = validateParams(resolvedParams, phoneParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = parseInt(paramsValidationResult.data.id);
  const phoneId = parseInt(paramsValidationResult.data.phoneId);

  // Authorization - check access to phone
  const authzResult = await checkResourceAccess(userId, role, "phone", "update", phoneId);
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, personPhoneSchema.partial());
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if phone exists and belongs to person
    const existing = await findPersonPhone(personId, phoneId);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Phone not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Update phone
    const phone = await editPersonPhone(phoneId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: phone,
        message: "Phone updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating phone:", error);
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
 * DELETE /api/persons/[id]/phones/[phoneId]
 * Delete a phone number
 * Access:
 * - Patient: Own phones only
 * - Admin: All phones
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; phoneId: string }> }
) {
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

  // Validate parameters
  const paramsValidationResult = validateParams(resolvedParams, phoneParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = parseInt(paramsValidationResult.data.id);
  const phoneId = parseInt(paramsValidationResult.data.phoneId);

  // Authorization - check access to phone
  const authzResult = await checkResourceAccess(userId, role, "phone", "delete", phoneId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Check if phone exists and belongs to person
    const existing = await findPersonPhone(personId, phoneId);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Phone not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete phone
    await deletePersonPhone(phoneId);

    return NextResponse.json(
      {
        success: true,
        message: "Phone deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting phone:", error);
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
