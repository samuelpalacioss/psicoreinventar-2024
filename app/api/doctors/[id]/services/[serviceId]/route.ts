import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateDoctorServiceSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/types/enums";
import { findDoctorById, findDoctorService, editDoctorService, deleteDoctorService } from "@/src/dal";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const serviceParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
  serviceId: z.string().regex(/^\d+$/, "Service ID must be a number"),
});

/**
 * PATCH /api/doctors/[id]/services/[serviceId]
 * Update service pricing for a doctor
 * Access:
 * - Doctor: Own services only
 * - Admin: All services
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, serviceParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const serviceId = parseInt(paramsValidationResult.data.serviceId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "doctor-service",
    "update",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateDoctorServiceSchema);
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

    // Verify doctor-service association exists
    const existingDoctorService = await findDoctorService(doctorId, serviceId);

    if (!existingDoctorService) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Service not found for this doctor",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Update service pricing
    const updatedDoctorService = await editDoctorService(doctorId, serviceId, validatedData);

    return NextResponse.json(
      {
        success: true,
        data: updatedDoctorService,
        message: "Service pricing updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating service pricing:", error);
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
 * DELETE /api/doctors/[id]/services/[serviceId]
 * Remove a service from a doctor
 * Access:
 * - Doctor: Own services only
 * - Admin: All services
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, serviceParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const serviceId = parseInt(paramsValidationResult.data.serviceId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "doctor-service",
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

    // Verify doctor-service association exists
    const existingDoctorService = await findDoctorService(doctorId, serviceId);

    if (!existingDoctorService) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Service not found for this doctor",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete doctor-service association
    await deleteDoctorService(doctorId, serviceId);

    return NextResponse.json(
      {
        success: true,
        message: "Service removed successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error removing service:", error);
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
