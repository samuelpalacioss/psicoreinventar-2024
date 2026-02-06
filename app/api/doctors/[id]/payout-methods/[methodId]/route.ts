import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { updatePayoutMethodSchema } from "@/lib/api/schemas/doctor.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { doctors, payoutMethods } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import * as z from "zod";

const payoutMethodParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid doctor ID"),
  methodId: z.string().regex(/^\d+$/, "Invalid payout method ID"),
});

/**
 * GET /api/doctors/[id]/payout-methods/[methodId]
 * Get a single payout method for a doctor
 * Access:
 * - Doctor: Own payout methods only
 * - Admin: All payout methods
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; methodId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, payoutMethodParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = Number(paramsValidationResult.data.id);
  const methodId = Number(paramsValidationResult.data.methodId);

  // Authorization - check access to parent doctor resource
  const authzResult = await checkResourceAccess(userId, role as Role, "payout-method", "read", doctorId);
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

    // Fetch the payout method
    const payoutMethod = await db.query.payoutMethods.findFirst({
      where: and(eq(payoutMethods.id, methodId), eq(payoutMethods.doctorId, doctorId)),
    });

    if (!payoutMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payout method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: payoutMethod,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching payout method:", error);
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
 * PATCH /api/doctors/[id]/payout-methods/[methodId]
 * Update a payout method
 * Can update: nickname, isPreferred, bank account details, or pago móvil details
 * Access:
 * - Doctor: Own payout methods only
 * - Admin: All payout methods
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; methodId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, payoutMethodParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = Number(paramsValidationResult.data.id);
  const methodId = Number(paramsValidationResult.data.methodId);

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "payout-method", "update", doctorId);
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, updatePayoutMethodSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Check if the payout method exists for this doctor
    const existing = await db.query.payoutMethods.findFirst({
      where: and(eq(payoutMethods.id, methodId), eq(payoutMethods.doctorId, doctorId)),
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payout method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const payoutMethodType = existing.type;

    // Separate update fields
    const updateFields: Partial<typeof validatedData> = {};

    // Extract common fields
    if (validatedData.nickname !== undefined) updateFields.nickname = validatedData.nickname;
    if (validatedData.isPreferred !== undefined) updateFields.isPreferred = validatedData.isPreferred;

    // Extract type-specific fields based on existing payout method type
    const bankTransferFields = ["bankName", "accountNumber", "accountType"] as const;
    const pagoMovilFields = ["pagoMovilPhone", "pagoMovilBankCode", "pagoMovilCi"] as const;

    // Check for invalid field combinations
    if (payoutMethodType === "bank_transfer") {
      // Extract bank transfer fields
      for (const field of bankTransferFields) {
        if (validatedData[field] !== undefined) {
          (updateFields as any)[field] = validatedData[field];
        }
      }

      // Reject pago móvil fields for bank transfer payout methods
      const invalidFields = pagoMovilFields.filter((field) => validatedData[field] !== undefined);
      if (invalidFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Cannot update pago móvil fields for a bank transfer payout method: ${invalidFields.join(", ")}`,
              code: "INVALID_FIELDS",
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
    } else if (payoutMethodType === "pago_movil") {
      // Extract pago móvil fields
      for (const field of pagoMovilFields) {
        if (validatedData[field] !== undefined) {
          (updateFields as any)[field] = validatedData[field];
        }
      }

      // Reject bank transfer fields for pago móvil payout methods
      const invalidFields = bankTransferFields.filter((field) => validatedData[field] !== undefined);
      if (invalidFields.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Cannot update bank transfer fields for a pago móvil payout method: ${invalidFields.join(", ")}`,
              code: "INVALID_FIELDS",
            },
          },
          { status: StatusCodes.BAD_REQUEST }
        );
      }
    }

    // If setting as preferred, unset other preferred methods for this doctor
    if (validatedData.isPreferred) {
      await db
        .update(payoutMethods)
        .set({ isPreferred: false, updatedAt: new Date() })
        .where(and(eq(payoutMethods.doctorId, doctorId), eq(payoutMethods.isPreferred, true)));
    }

    // Update the payout method
    const [updatedPayoutMethod] = await db
      .update(payoutMethods)
      .set({
        ...updateFields,
        updatedAt: new Date(),
      })
      .where(and(eq(payoutMethods.id, methodId), eq(payoutMethods.doctorId, doctorId)))
      .returning();

    return NextResponse.json(
      {
        success: true,
        data: updatedPayoutMethod,
        message: "Payout method updated successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error updating payout method:", error);
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
 * DELETE /api/doctors/[id]/payout-methods/[methodId]
 * Delete a payout method
 * Access:
 * - Doctor: Own payout methods only
 * - Admin: All payout methods
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; methodId: string }> }
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
  const paramsValidationResult = validateParams(resolvedParams, payoutMethodParamsSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const doctorId = Number(paramsValidationResult.data.id);
  const methodId = Number(paramsValidationResult.data.methodId);

  // Authorization
  const authzResult = await checkResourceAccess(userId, role as Role, "payout-method", "delete", doctorId);
  if (!authzResult.allowed) return authzResult.error;

  try {
    // Check if the payout method exists for this doctor
    const existing = await db.query.payoutMethods.findFirst({
      where: and(eq(payoutMethods.id, methodId), eq(payoutMethods.doctorId, doctorId)),
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payout method not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Delete the payout method (CASCADE will handle related records)
    await db.delete(payoutMethods).where(and(eq(payoutMethods.id, methodId), eq(payoutMethods.doctorId, doctorId)));

    return NextResponse.json(
      {
        success: true,
        message: "Payout method deleted successfully",
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error deleting payout method:", error);
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
