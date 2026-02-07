import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateConditionSchema } from "@/lib/api/schemas/simple.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/src/types";
import { findConditionById, editCondition, deleteCondition } from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/conditions/[id]
 * Get a condition by ID
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
    const condition = await findConditionById(id);

    if (!condition) {
      return NextResponse.json(
        { success: false, error: { message: "Condition not found", code: "NOT_FOUND" } },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json({ success: true, data: condition }, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error fetching condition:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

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
  const authzResult = await checkResourceAccess(userId, role as Role, "condition", "update");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const id = parseInt(paramsValidationResult.data.id);

  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateConditionSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    const existing = await findConditionById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { message: "Condition not found", code: "NOT_FOUND" } },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const condition = await editCondition(id, validatedData);

    return NextResponse.json(
      { success: true, data: condition, message: "Condition updated successfully" },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating condition:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

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
  const authzResult = await checkResourceAccess(userId, role as Role, "condition", "delete");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const id = parseInt(paramsValidationResult.data.id);

  try {
    const existing = await findConditionById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { message: "Condition not found", code: "NOT_FOUND" } },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    await deleteCondition(id);

    return NextResponse.json(
      { success: true, message: "Condition deleted successfully" },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting condition:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
