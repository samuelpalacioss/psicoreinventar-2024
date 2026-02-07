import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { Role } from "@/src/types";
import { findDoctorById, findDoctorTreatmentMethod, deleteDoctorTreatmentMethod } from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const treatmentMethodParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
  treatmentMethodId: z.string().regex(/^\d+$/, "Treatment Method ID must be a number"),
});

/**
 * DELETE /api/doctors/[id]/treatment-methods/[treatmentMethodId]
 * Remove a treatment method from a doctor
 * Access:
 * - Doctor: Own treatment methods only
 * - Admin: All treatment methods
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; treatmentMethodId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, treatmentMethodParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const treatmentMethodId = parseInt(paramsValidationResult.data.treatmentMethodId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "doctor-treatment-method",
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

    // Verify doctor-treatment method association exists
    const existingDoctorTreatmentMethod = await findDoctorTreatmentMethod(doctorId, treatmentMethodId);

    if (!existingDoctorTreatmentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Treatment method not found for this doctor",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete doctor-treatment method association
    await deleteDoctorTreatmentMethod(doctorId, treatmentMethodId);

    return NextResponse.json(
      {
        success: true,
        message: "Treatment method removed successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error removing treatment method:", error);
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
