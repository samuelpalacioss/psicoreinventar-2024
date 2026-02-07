import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateTreatmentMethodSchema } from "@/lib/api/schemas/simple.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/src/types";
import { findTreatmentMethodById, editTreatmentMethod, deleteTreatmentMethod } from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/treatment-methods/[id]
 * Get a single treatment method by ID
 * Public access
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const id = parseInt(paramsValidationResult.data.id);

  try {
    const treatmentMethod = await findTreatmentMethodById(id);

    if (!treatmentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Treatment method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: treatmentMethod,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching treatment method:", error);
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
 * PATCH /api/treatment-methods/[id]
 * Update a treatment method
 * Admin only
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  const authzResult = await checkResourceAccess(userId, role, "treatment-method", "update");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const id = parseInt(paramsValidationResult.data.id);

  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateTreatmentMethodSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    const existing = await findTreatmentMethodById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Treatment method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const treatmentMethod = await editTreatmentMethod(id, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: treatmentMethod,
        message: "Treatment method updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating treatment method:", error);
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
 * DELETE /api/treatment-methods/[id]
 * Delete a treatment method
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

  const authzResult = await checkResourceAccess(userId, role, "treatment-method", "delete");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const id = parseInt(paramsValidationResult.data.id);

  try {
    const existing = await findTreatmentMethodById(id);

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Treatment method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    await deleteTreatmentMethod(id);

    return NextResponse.json(
      {
        success: true,
        message: "Treatment method deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting treatment method:", error);
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
