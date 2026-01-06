import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateEducationSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { doctors, educations, institutions } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const educationParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
  educationId: z.string().regex(/^\d+$/, "Education ID must be a number"),
});

/**
 * PATCH /api/doctors/[id]/educations/[educationId]
 * Update an education record
 * Access:
 * - Doctor: Own educations only
 * - Admin: All educations
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; educationId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, educationParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const educationId = parseInt(paramsValidationResult.data.educationId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "education",
    "update",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateEducationSchema);
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

    // Verify education exists and belongs to this doctor
    const existingEducation = await db.query.educations.findFirst({
      where: and(eq(educations.id, educationId), eq(educations.doctorId, doctorId)),
    });

    if (!existingEducation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Education record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // If updating institution, verify it exists
    if (validatedData.institutionId) {
      const institution = await db.query.institutions.findFirst({
        where: eq(institutions.id, validatedData.institutionId),
      });

      if (!institution) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Institution not found",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }
    }

    // Update education
    const [updatedEducation] = await db
      .update(educations)
      .set(validatedData)
      .where(eq(educations.id, educationId))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: updatedEducation,
        message: "Education record updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating education:", error);
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
 * DELETE /api/doctors/[id]/educations/[educationId]
 * Delete an education record
 * Access:
 * - Doctor: Own educations only
 * - Admin: All educations
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; educationId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, educationParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const educationId = parseInt(paramsValidationResult.data.educationId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "education",
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

    // Verify education exists and belongs to this doctor
    const existingEducation = await db.query.educations.findFirst({
      where: and(eq(educations.id, educationId), eq(educations.doctorId, doctorId)),
    });

    if (!existingEducation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Education record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete education
    await db.delete(educations).where(eq(educations.id, educationId));

    return NextResponse.json(
      {
        success: true,
        message: "Education record deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting education:", error);
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
