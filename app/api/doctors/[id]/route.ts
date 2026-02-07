import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateDoctorSchema } from "@/lib/api/schemas/doctor.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import {
  findDoctorById,
  findDoctorByCi,
  findPlaceById,
  editDoctor,
  deleteDoctor,
} from "@/src/dal";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/doctors/[id]
 * Get doctor details with all relations
 * Access:
 * - Patient: All active doctors (public)
 * - Doctor: Own profile only
 * - Admin: All doctors
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

  const doctorId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to doctor
  const authzResult = await checkResourceAccess(userId, role as Role, "doctor", "read", doctorId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Get doctor with all relations
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

    return NextResponse.json(
      {
        success: true,
        data: doctor,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching doctor:", error);
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
 * PATCH /api/doctors/[id]
 * Update doctor profile
 * Access:
 * - Doctor: Own profile only
 * - Admin: All doctors
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to doctor
  const authzResult = await checkResourceAccess(userId, role as Role, "doctor", "update", doctorId);
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateDoctorSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Verify doctor exists
    const existingDoctor = await findDoctorById(doctorId);

    if (!existingDoctor) {
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

    // If updating CI, check for duplicates
    if (validatedData.ci && validatedData.ci !== existingDoctor.ci) {
      const duplicateCI = await findDoctorByCi(validatedData.ci);

      if (duplicateCI) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "CI already exists",
              code: "DUPLICATE_ENTRY",
            },
          },
          { status: StatusCodes.CONFLICT }
        );
      }
    }

    // If updating place, verify it exists
    if (validatedData.placeId) {
      const place = await findPlaceById(validatedData.placeId);

      if (!place) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Place not found",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }
    }

    // Update doctor
    const updatedDoctor = await editDoctor(doctorId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: updatedDoctor,
        message: "Doctor profile updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating doctor:", error);
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
 * DELETE /api/doctors/[id]
 * Delete doctor profile (hard delete with CASCADE)
 * Access:
 * - Admin only
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

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to doctor
  const authzResult = await checkResourceAccess(userId, role as Role, "doctor", "delete", doctorId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Verify doctor exists
    const existingDoctor = await findDoctorById(doctorId);

    if (!existingDoctor) {
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

    // Delete doctor (CASCADE will delete all related records)
    await deleteDoctor(doctorId);

    return NextResponse.json(
      {
        success: true,
        message: "Doctor deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting doctor:", error);
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
