import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { persons, progresses, doctors, conditions, appointments } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const progressParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid person ID"),
  progressId: z.string().regex(/^\d+$/, "Invalid progress ID"),
});

const updateProgressSchema = z.object({
  conditionId: z.number().int().positive().optional(),
  title: z.string().min(1).max(255).optional(),
  level: z.string().max(100).optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/persons/[id]/progresses/[progressId]
 * Get a single progress record for a person
 * Access:
 * - Patient: Own progress records only
 * - Doctor: Assigned patients' progress records
 * - Admin: No access (sensitive data)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; progressId: string }> }
) {
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

  // Validate parameters
  const paramsValidationResult = validateParams(resolvedParams, progressParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = Number(paramsValidationResult.data.id);
  const progressId = Number(paramsValidationResult.data.progressId);

  // Authorization - check access to progress resource
  const authzResult = await checkResourceAccess(userId, role as Role, "progress", "read", personId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Verify person exists
    const person = await db.query.persons.findFirst({
      where: eq(persons.id, personId),
    });

    if (!person) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Person not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Fetch the progress record with relations
    const progress = await db.query.progresses.findFirst({
      where: and(
        eq(progresses.id, progressId),
        eq(progresses.personId, personId)
      ),
      with: {
        doctor: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
        condition: true,
        appointment: {
          columns: {
            id: true,
            startDateTime: true,
            endDateTime: true,
            status: true,
          },
        },
      },
    });

    if (!progress) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Progress record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: progress,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching progress record:", error);
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
 * PATCH /api/persons/[id]/progresses/[progressId]
 * Update a progress record
 * Access:
 * - Patient: No access
 * - Doctor: Can update assigned patients' progress records
 * - Admin: No access (sensitive data)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; progressId: string }> }
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

  // Validate parameters
  const paramsValidationResult = validateParams(resolvedParams, progressParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = Number(paramsValidationResult.data.id);
  const progressId = Number(paramsValidationResult.data.progressId);

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "progress", "update", personId);
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updateProgressSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if the progress record exists for this person
    const existing = await db.query.progresses.findFirst({
      where: and(
        eq(progresses.id, progressId),
        eq(progresses.personId, personId)
      ),
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Progress record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // If conditionId is provided, verify it exists
    if (validatedData.conditionId !== undefined) {
      const conditionExists = await db.query.conditions.findFirst({
        where: eq(conditions.id, validatedData.conditionId),
      });

      if (!conditionExists) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Condition not found",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
    }

    // Update the progress record
    const [updatedProgress] = await db
      .update(progresses)
      .set(validatedData)
      .where(
        and(
          eq(progresses.id, progressId),
          eq(progresses.personId, personId)
        )
      )
      .returning();

    // Fetch complete data with relations
    const completeData = await db.query.progresses.findFirst({
      where: eq(progresses.id, progressId),
      with: {
        doctor: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
        condition: true,
        appointment: {
          columns: {
            id: true,
            startDateTime: true,
            endDateTime: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: completeData,
        message: "Progress record updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating progress record:", error);
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
 * DELETE /api/persons/[id]/progresses/[progressId]
 * Delete a progress record
 * Access:
 * - Patient: No access
 * - Doctor: Can delete assigned patients' progress records
 * - Admin: No access (sensitive data)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; progressId: string }> }
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

  // Validate parameters
  const paramsValidationResult = validateParams(resolvedParams, progressParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = Number(paramsValidationResult.data.id);
  const progressId = Number(paramsValidationResult.data.progressId);

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "progress", "delete", personId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Check if the progress record exists for this person
    const existing = await db.query.progresses.findFirst({
      where: and(
        eq(progresses.id, progressId),
        eq(progresses.personId, personId)
      ),
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Progress record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete the progress record
    await db
      .delete(progresses)
      .where(
        and(
          eq(progresses.id, progressId),
          eq(progresses.personId, personId)
        )
      );

    return NextResponse.json(
      {
        success: true,
        message: "Progress record deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting progress record:", error);
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
