import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateServiceSchema } from "@/lib/api/schemas/simple.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { services } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/services/[id]
 * Get a single service by ID
 * Public access
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const id = parseInt(paramsValidationResult.data.id);

  try {
    const service = await db.query.services.findFirst({
      where: eq(services.id, id),
    });

    if (!service) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Service not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching service:", error);
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
 * PATCH /api/services/[id]
 * Update a service
 * Admin only
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication (supports dev token in development mode)
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

  // Authorization (admin only)
  const authzResult = await checkResourceAccess(userId, role as Role, "service", "update");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const id = parseInt(paramsValidationResult.data.id);

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateServiceSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if service exists
    const existing = await db.query.services.findFirst({
      where: eq(services.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Service not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Update service
    const [service] = await db
      .update(services)
      .set(validatedData)
      .where(eq(services.id, id))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: service,
        message: "Service updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating service:", error);
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
 * DELETE /api/services/[id]
 * Delete a service
 * Admin only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentication (supports dev token in development mode)
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

  // Authorization (admin only)
  const authzResult = await checkResourceAccess(userId, role as Role, "service", "delete");
  if (!authzResult.allowed) return authzResult.error;

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const id = parseInt(paramsValidationResult.data.id);

  try {
    // Check if service exists
    const existing = await db.query.services.findFirst({
      where: eq(services.id, id),
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Service not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete service (CASCADE will handle related records)
    await db.delete(services).where(eq(services.id, id));

    return NextResponse.json(
      {
        success: true,
        message: "Service deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting service:", error);
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
