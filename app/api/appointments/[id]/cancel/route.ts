import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { cancelAppointmentSchema } from "@/lib/api/schemas/appointment.schemas";
import { Role } from "@/types/enums";
import {
  findAppointmentByIdBasic,
  cancelAppointment,
  findAppointmentById,
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * POST /api/appointments/[id]/cancel
 * Cancel an appointment
 * Access:
 * - Patient: Cancel own appointments (must be at least 24 hours before)
 * - Admin: Cancel any appointment (no time restriction)
 *
 * Business rules:
 * - Patients can only cancel if appointment is at least 24 hours away
 * - Admins can cancel anytime
 * - Cannot cancel already completed or cancelled appointments
 * - Cancellation reason is required
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // Authorization - check update permission (canceling is a type of update)
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
  const bodyValidationResult = validateBody(body, cancelAppointmentSchema);
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

    // Check if appointment can be cancelled
    if (existingAppointment.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Appointment is already cancelled",
            code: "BAD_REQUEST",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    if (existingAppointment.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Cannot cancel a completed appointment",
            code: "BAD_REQUEST",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // Cancel the appointment with atomic 24-hour check for patients
    const enforceAdvancePolicy = role === Role.PATIENT;
    const cancelledAppointment = await cancelAppointment(
      appointmentId,
      validatedData.cancellationReason,
      enforceAdvancePolicy
    );

    // If no rows were updated for patients, it means the 24-hour check failed
    if (!cancelledAppointment && role === Role.PATIENT) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Appointments can only be cancelled at least 24 hours in advance. Please contact support for assistance.",
            code: "BAD_REQUEST",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // Fetch complete appointment data with relations
    const completeAppointment = await findAppointmentById(appointmentId);

    return NextResponse.json(
      {
        success: true,
        data: completeAppointment,
        message: "Appointment cancelled successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error cancelling appointment:", error);
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
