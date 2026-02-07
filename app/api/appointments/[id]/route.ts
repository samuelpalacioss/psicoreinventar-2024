import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateAppointmentSchema } from "@/lib/api/schemas/appointment.schemas";
import { Role } from "@/types/enums";
import {
  findAppointmentById,
  findAppointmentByIdBasic,
  findAppointmentByIdWithDeleted,
  editAppointment,
  softDeleteAppointment,
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/appointments/[id]
 * Get a single appointment by ID
 * Access:
 * - Patient: Own appointments
 * - Doctor: Assigned appointments
 * - Admin: All appointments
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID
  const appointmentId = parseInt(resolvedParams.id);
  if (isNaN(appointmentId)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid appointment ID",
          code: "VALIDATION_ERROR",
        },
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

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

  // Authorization
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "appointment",
    "read",
    appointmentId
  );
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Fetch appointment with relations (exclude soft-deleted)
    const appointment = await findAppointmentById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Appointment not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: appointment,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching appointment:", error);
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
 * PATCH /api/appointments/[id]
 * Update an appointment (status, notes)
 * Access:
 * - Patient: Own appointments (can only update notes, not status)
 * - Doctor: Assigned appointments (can update status and notes)
 * - Admin: All appointments (full update access)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID
  const appointmentId = parseInt(resolvedParams.id);
  if (isNaN(appointmentId)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid appointment ID",
          code: "VALIDATION_ERROR",
        },
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

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

  // Authorization
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "appointment",
    "update",
    appointmentId
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));

  // Role-based field restrictions: Patients cannot change status
  if (role === Role.PATIENT && body.status !== undefined) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Patients cannot change appointment status. Use the cancel endpoint to cancel appointments.",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  const bodyValidationResult = validateBody(body, updateAppointmentSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if appointment exists and is not soft-deleted
    const existingAppointment = await findAppointmentByIdBasic(appointmentId);

    if (!existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Appointment not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Validate status transitions
    if (validatedData.status) {
      const currentStatus = existingAppointment.status;
      const newStatus = validatedData.status;

      // Business rule: Cannot change from completed or cancelled
      if (currentStatus === "completed" || currentStatus === "cancelled") {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Cannot update appointment with status '${currentStatus}'`,
              code: "BAD_REQUEST",
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        );
      }

      // Validate status flow: scheduled → confirmed → completed
      const validTransitions: Record<string, string[]> = {
        scheduled: ["confirmed", "cancelled"],
        confirmed: ["completed", "cancelled"],
      };

      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Invalid status transition from '${currentStatus}' to '${newStatus}'`,
              code: "BAD_REQUEST",
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
    }

    // Update appointment
    await editAppointment(appointmentId, validatedData);

    // Fetch complete appointment data with relations
    const completeAppointment = await findAppointmentById(appointmentId);

    return NextResponse.json(
      {
        success: true,
        data: completeAppointment,
        message: "Appointment updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating appointment:", error);
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
 * DELETE /api/appointments/[id]
 * Delete an appointment
 * Access:
 * - Admin only
 * Note: Patients should use the cancel endpoint instead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID
  const appointmentId = parseInt(resolvedParams.id);
  if (isNaN(appointmentId)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid appointment ID",
          code: "VALIDATION_ERROR",
        },
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

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

  // Authorization
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "appointment",
    "delete",
    appointmentId
  );
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Check if appointment exists and is not already soft-deleted
    const existingAppointment = await findAppointmentByIdWithDeleted(appointmentId);

    if (!existingAppointment || existingAppointment.deletedAt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Appointment not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Soft delete to preserve financial audit trail
    await softDeleteAppointment(appointmentId);

    return NextResponse.json(
      {
        success: true,
        message: "Appointment deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
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
