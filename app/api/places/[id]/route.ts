import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updatePlaceSchema } from "@/lib/api/schemas/simple.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/src/types";
import { findPlaceById, editPlace, deletePlace } from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/places/[id]
 * Get a place by ID
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
    const place = await findPlaceById(id);
    if (!place) {
      return NextResponse.json(
        { success: false, error: { message: "Place not found", code: "NOT_FOUND" } },
        { status: StatusCodes.NOT_FOUND }
      );
    }
    return NextResponse.json({ success: true, data: place }, { status: StatusCodes.OK });
  } catch (error) {
    console.error("Error fetching place:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * PATCH /api/places/[id]
 * Update a place by ID
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
  const authzResult = await checkResourceAccess(userId, role as Role, "place", "update");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const id = parseInt(paramsValidationResult.data.id);

  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updatePlaceSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    const existing = await findPlaceById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { message: "Place not found", code: "NOT_FOUND" } },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const place = await editPlace(id, validatedData);
    return NextResponse.json(
      { success: true, data: place, message: "Place updated successfully" },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating place:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/places/[id]
 * Delete a place by ID
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
  const authzResult = await checkResourceAccess(userId, role as Role, "place", "delete");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const id = parseInt(paramsValidationResult.data.id);

  try {
    const existing = await findPlaceById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { message: "Place not found", code: "NOT_FOUND" } },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    await deletePlace(id);
    return NextResponse.json(
      { success: true, message: "Place deleted successfully" },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting place:", error);
    return NextResponse.json(
      { success: false, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
