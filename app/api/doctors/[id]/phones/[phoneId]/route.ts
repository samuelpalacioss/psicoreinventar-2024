import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { doctorPhoneSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/src/types";
import { findDoctorById, findDoctorPhone, editDoctorPhone, deleteDoctorPhone } from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const phoneParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
  phoneId: z.string().regex(/^\d+$/, "Phone ID must be a number"),
});

/**
 * PATCH /api/doctors/[id]/phones/[phoneId]
 * Update a phone number
 * Access:
 * - Doctor: Own phones only
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

  // Validate params
  const paramsValidationResult = validateParams(resolvedParams, phoneParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const phoneId = parseInt(paramsValidationResult.data.phoneId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "phone",
    "update",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, doctorPhoneSchema);
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

    // Verify phone exists and belongs to this doctor
    const existingPhone = await findDoctorPhone(doctorId, phoneId);

    if (!existingPhone) {
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
    const updatedPhone = await editDoctorPhone(phoneId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: updatedPhone,
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
 * DELETE /api/doctors/[id]/phones/[phoneId]
 * Delete a phone number
 * Access:
 * - Doctor: Own phones only
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

  // Validate params
  const paramsValidationResult = validateParams(resolvedParams, phoneParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const phoneId = parseInt(paramsValidationResult.data.phoneId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "phone",
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

    // Verify phone exists and belongs to this doctor
    const existingPhone = await findDoctorPhone(doctorId, phoneId);

    if (!existingPhone) {
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
    await deleteDoctorPhone(phoneId);

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
