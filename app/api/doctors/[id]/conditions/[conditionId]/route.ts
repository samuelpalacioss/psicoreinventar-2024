import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateDoctorConditionSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { doctors, doctorConditions } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const conditionParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
  conditionId: z.string().regex(/^\d+$/, "Condition ID must be a number"),
});

/**
 * PATCH /api/doctors/[id]/conditions/[conditionId]
 * Update condition type (primary/other) for a doctor
 * Access:
 * - Doctor: Own conditions only
 * - Admin: All conditions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; conditionId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, conditionParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const conditionId = parseInt(paramsValidationResult.data.conditionId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "doctor-condition",
    "update",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateDoctorConditionSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Verify doctor exists
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.id, doctorId),
    });

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

    // Verify doctor-condition association exists
    const existingDoctorCondition = await db.query.doctorConditions.findFirst({
      where: and(eq(doctorConditions.doctorId, doctorId), eq(doctorConditions.conditionId, conditionId)),
    });

    if (!existingDoctorCondition) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Condition not found for this doctor",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Update condition type
    const [updatedDoctorCondition] = await db
      .update(doctorConditions)
      .set(validatedData)
      .where(and(eq(doctorConditions.doctorId, doctorId), eq(doctorConditions.conditionId, conditionId)))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: updatedDoctorCondition,
        message: "Condition type updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating condition type:", error);
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
 * DELETE /api/doctors/[id]/conditions/[conditionId]
 * Remove a condition from a doctor
 * Access:
 * - Doctor: Own conditions only
 * - Admin: All conditions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; conditionId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, conditionParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const conditionId = parseInt(paramsValidationResult.data.conditionId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "doctor-condition",
    "delete",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Verify doctor exists
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.id, doctorId),
    });

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

    // Verify doctor-condition association exists
    const existingDoctorCondition = await db.query.doctorConditions.findFirst({
      where: and(eq(doctorConditions.doctorId, doctorId), eq(doctorConditions.conditionId, conditionId)),
    });

    if (!existingDoctorCondition) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Condition not found for this doctor",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete doctor-condition association
    await db
      .delete(doctorConditions)
      .where(and(eq(doctorConditions.doctorId, doctorId), eq(doctorConditions.conditionId, conditionId)));

    return NextResponse.json(
      {
        success: true,
        message: "Condition removed successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error removing condition:", error);
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

