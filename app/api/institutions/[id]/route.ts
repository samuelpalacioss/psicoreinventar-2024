import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateInstitutionSchema } from "@/lib/api/schemas/simple.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/src/types";
import { findInstitutionById, editInstitution, deleteInstitution } from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/institutions/[id]
 * Get an institution by ID
 * Public access (no auth required for reading)
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const id = parseInt(paramsValidationResult.data.id);

  try {
    const institution = await findInstitutionById(id);

    if (!institution) {
      return NextResponse.json(
        { success: false, error: { message: "Institution not found", code: "NOT_FOUND" } },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json({ success: true, data: institution }, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error fetching institution:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PATCH /api/institutions/[id]
 * Update an institution by ID
 * Admin only
 */

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
  const authzResult = await checkResourceAccess(userId, role, "institution", "update");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const id = parseInt(paramsValidationResult.data.id);

  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateInstitutionSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    const existing = await findInstitutionById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { message: "Institution not found", code: "NOT_FOUND" } },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Only admins can change isVerified status
    const updateData: typeof validatedData = { ...validatedData };
    if (role !== Role.ADMIN) {
      delete updateData.isVerified;
    }

    const institution = await editInstitution(id, updateData);

    return NextResponse.json(
      { success: true, data: institution, message: "Institution updated successfully" },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating institution:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/institutions/[id]
 * Delete an institution by ID
 * Admin only
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
  const authzResult = await checkResourceAccess(userId, role, "institution", "delete");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const id = parseInt(paramsValidationResult.data.id);

  try {
    const existing = await findInstitutionById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { message: "Institution not found", code: "NOT_FOUND" } },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    await deleteInstitution(id);

    return NextResponse.json(
      { success: true, message: "Institution deleted successfully" },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting institution:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
