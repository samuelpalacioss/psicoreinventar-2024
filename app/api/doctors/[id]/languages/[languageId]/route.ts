import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updateDoctorLanguageSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { doctors, doctorLanguages } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const languageParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number"),
  languageId: z.string().regex(/^\d+$/, "Language ID must be a number"),
});

/**
 * PATCH /api/doctors/[id]/languages/[languageId]
 * Update language type (native/foreign) for a doctor
 * Access:
 * - Doctor: Own languages only
 * - Admin: All languages
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; languageId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, languageParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const languageId = parseInt(paramsValidationResult.data.languageId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "doctor-language",
    "update",
    undefined,
    { doctorId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateDoctorLanguageSchema);
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

    // Verify doctor-language association exists
    const existingDoctorLanguage = await db.query.doctorLanguages.findFirst({
      where: and(eq(doctorLanguages.doctorId, doctorId), eq(doctorLanguages.languageId, languageId)),
    });

    if (!existingDoctorLanguage) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Language not found for this doctor",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Update language type
    const [updatedDoctorLanguage] = await db
      .update(doctorLanguages)
      .set(validatedData)
      .where(and(eq(doctorLanguages.doctorId, doctorId), eq(doctorLanguages.languageId, languageId)))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: updatedDoctorLanguage,
        message: "Language type updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating language type:", error);
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
 * DELETE /api/doctors/[id]/languages/[languageId]
 * Remove a language from a doctor
 * Access:
 * - Doctor: Own languages only
 * - Admin: All languages
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; languageId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, languageParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = parseInt(paramsValidationResult.data.id);
  const languageId = parseInt(paramsValidationResult.data.languageId);

  // Authorization - check access to parent doctor
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "doctor-language",
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

    // Verify doctor-language association exists
    const existingDoctorLanguage = await db.query.doctorLanguages.findFirst({
      where: and(eq(doctorLanguages.doctorId, doctorId), eq(doctorLanguages.languageId, languageId)),
    });

    if (!existingDoctorLanguage) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Language not found for this doctor",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete doctor-language association
    await db
      .delete(doctorLanguages)
      .where(and(eq(doctorLanguages.doctorId, doctorId), eq(doctorLanguages.languageId, languageId)));

    return NextResponse.json(
      {
        success: true,
        message: "Language removed successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error removing language:", error);
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

