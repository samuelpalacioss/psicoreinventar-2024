import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateScheduleSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/src/types";
import { findDoctorById, findDoctorSchedule, editDoctorSchedule, deleteDoctorSchedule } from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const scheduleParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
  scheduleId: z.string().regex(/^\d+$/, "Schedule ID must be a number"),
});

/**
 * PATCH /api/doctors/[id]/schedules/[scheduleId]
 * Update a schedule record
 * Access:
 * - Doctor: Own schedules only
 * - Admin: All schedules
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
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

  // Validate params
  const paramsValidationResult = validateParams(resolvedParams, scheduleParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const scheduleId = parseInt(paramsValidationResult.data.scheduleId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "schedule",
    "update",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateScheduleSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Verify doctor exists
    const doctor = await findDoctorById(doctorId);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctor not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Verify schedule exists and belongs to this doctor
    const existingSchedule = await findDoctorSchedule(doctorId, scheduleId);

    if (!existingSchedule) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Schedule not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Update schedule
    const updatedSchedule = await editDoctorSchedule(scheduleId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: updatedSchedule,
        message: "Schedule updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating schedule:", error);
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
 * DELETE /api/doctors/[id]/schedules/[scheduleId]
 * Delete a schedule record
 * Access:
 * - Doctor: Own schedules only
 * - Admin: All schedules
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
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

  // Validate params
  const paramsValidationResult = validateParams(resolvedParams, scheduleParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const scheduleId = parseInt(paramsValidationResult.data.scheduleId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "schedule",
    "delete",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Verify doctor exists
    const doctor = await findDoctorById(doctorId);

    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctor not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Verify schedule exists and belongs to this doctor
    const existingSchedule = await findDoctorSchedule(doctorId, scheduleId);

    if (!existingSchedule) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Schedule not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete schedule
    await deleteDoctorSchedule(scheduleId);

    return NextResponse.json(
      {
        success: true,
        message: "Schedule deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting schedule:", error);
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
