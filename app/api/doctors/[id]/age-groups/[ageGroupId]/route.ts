import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateAgeGroupSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/src/types";
import {
  findDoctorById,
  findDoctorAgeGroup,
  editDoctorAgeGroup,
  deleteDoctorAgeGroup,
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const ageGroupParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
  ageGroupId: z.string().regex(/^\d+$/, "Age Group ID must be a number"),
});

/**
 * PATCH /api/doctors/[id]/age-groups/[ageGroupId]
 * Update an age group
 * Access:
 * - Doctor: Own age groups only
 * - Admin: All age groups
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ageGroupId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, ageGroupParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const ageGroupId = parseInt(paramsValidationResult.data.ageGroupId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(userId, role, "age-group", "update", undefined, {
    doctorId,
  });
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateAgeGroupSchema);
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

    // Verify age group exists and belongs to this doctor
    const existingAgeGroup = await findDoctorAgeGroup(doctorId, ageGroupId);

    if (!existingAgeGroup) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Age group not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Update age group
    const updatedAgeGroup = await editDoctorAgeGroup(ageGroupId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: updatedAgeGroup,
        message: "Age group updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating age group:", error);
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
 * DELETE /api/doctors/[id]/age-groups/[ageGroupId]
 * Delete an age group
 * Access:
 * - Doctor: Own age groups only
 * - Admin: All age groups
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ageGroupId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, ageGroupParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const ageGroupId = parseInt(paramsValidationResult.data.ageGroupId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(userId, role, "age-group", "delete", undefined, {
    doctorId,
  });
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

    // Verify age group exists and belongs to this doctor
    const existingAgeGroup = await findDoctorAgeGroup(doctorId, ageGroupId);

    if (!existingAgeGroup) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Age group not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete age group
    await deleteDoctorAgeGroup(ageGroupId);

    return NextResponse.json(
      {
        success: true,
        message: "Age group deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting age group:", error);
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
