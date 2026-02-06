import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateProgressSchema } from "@/lib/api/schemas/progress.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { progresses, appointments } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/progresses/[id]
 * Get a single progress record by ID
 * Access:
 * - Patient: Own progress records
 * - Doctor: Progress records for assigned patients
 * - Admin: No access
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
  const progressId = Number(paramsValidationResult.data.id);

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "progress", "read", progressId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Fetch progress record with relations
    const progress = await db.query.progresses.findFirst({
      where: eq(progresses.id, progressId),
      with: {
        person: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
        doctor: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
        appointment: {
          columns: {
            id: true,
            startDateTime: true,
            status: true,
          },
        },
        condition: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!progress) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Progress record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: progress,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching progress record:", error);
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
 * PATCH /api/progresses/[id]
 * Update a progress record
 * Access:
 * - Doctor: Can update progress for assigned patients
 * - Patient: No permission
 * - Admin: No permission
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  // Only doctors can update progress records
  if (role !== Role.DOCTOR) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Only doctors can update progress records",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const progressId = Number(paramsValidationResult.data.id);

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "progress", "update", progressId);
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateProgressSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if progress record exists
    const existingProgress = await db.query.progresses.findFirst({
      where: eq(progresses.id, progressId),
      with: {
        doctor: true,
      },
    });

    if (!existingProgress) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Progress record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // If appointmentId is being updated, verify it exists and belongs to the patient and doctor
    if (validatedData.appointmentId) {
      const appointment = await db.query.appointments.findFirst({
        where: and(
          eq(appointments.id, validatedData.appointmentId),
          eq(appointments.personId, existingProgress.personId),
          eq(appointments.doctorId, existingProgress.doctorId)
        ),
      });

      if (!appointment) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Appointment not found or does not belong to this patient and doctor",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }
    }

    // Update progress record
    await db
      .update(progresses)
      .set({
        ...validatedData,
      })
      .where(eq(progresses.id, progressId));

    // Fetch complete progress data with relations
    const completeProgress = await db.query.progresses.findFirst({
      where: eq(progresses.id, progressId),
      with: {
        person: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
        doctor: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
        appointment: {
          columns: {
            id: true,
            startDateTime: true,
            status: true,
          },
        },
        condition: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: completeProgress,
        message: "Progress record updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating progress record:", error);
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
 * DELETE /api/progresses/[id]
 * Delete a progress record
 * Access:
 * - Doctor: Can delete progress for assigned patients
 * - Patient: No permission
 * - Admin: No permission
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  // Only doctors can delete progress records
  if (role !== Role.DOCTOR) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Only doctors can delete progress records",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const progressId = Number(paramsValidationResult.data.id);

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "progress", "delete", progressId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Check if progress record exists
    const existingProgress = await db.query.progresses.findFirst({
      where: eq(progresses.id, progressId),
    });

    if (!existingProgress) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Progress record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete progress record
    await db.delete(progresses).where(eq(progresses.id, progressId));

    return NextResponse.json(
      {
        success: true,
        message: "Progress record deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting progress record:", error);
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
