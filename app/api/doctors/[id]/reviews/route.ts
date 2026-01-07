import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { validateBody, validateParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { createReviewSchema } from "@/lib/api/schemas/review.schemas";
import { idParamSchema } from "@/lib/api/schemas/common.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { reviews, persons, doctors, appointments } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * GET /api/doctors/[id]/reviews
 * List all reviews for a specific doctor
 * Access:
 * - Public (anyone can read reviews)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting
  const rateLimitResponse = await withRateLimit(request, defaultRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const doctorId = Number(paramsValidationResult.data.id);

  try {
    // Check if doctor exists
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

    // Get all reviews for this doctor
    const doctorReviews = await db.query.reviews.findMany({
      where: eq(reviews.doctorId, doctorId),
      with: {
        person: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
      },
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
    });

    // Calculate average score
    const averageScore =
      doctorReviews.length > 0
        ? doctorReviews.reduce((sum, review) => sum + review.score, 0) / doctorReviews.length
        : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          reviews: doctorReviews,
          stats: {
            totalReviews: doctorReviews.length,
            averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
          },
        },
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching doctor reviews:", error);
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
 * POST /api/doctors/[id]/reviews
 * Create or update a review for a doctor
 * Access:
 * - Patient only (must have completed appointment with doctor)
 *
 * Business rules:
 * - Patient must have at least one completed appointment with the doctor
 * - One review per doctor per patient (upsert behavior)
 * - If review exists, it will be updated
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;
  const doctorId = Number(paramsValidationResult.data.id);

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

  // Only patients can create reviews
  if (role !== Role.PATIENT) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Only patients can create reviews",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createReviewSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Get patient's person record
    const person = await db.query.persons.findFirst({
      where: eq(persons.userId, userId),
    });

    if (!person) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Patient profile not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Check if doctor exists and is active
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

    // Check if patient has at least one completed appointment with this doctor
    const completedAppointment = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.personId, person.id),
        eq(appointments.doctorId, doctorId),
        eq(appointments.status, "completed")
      ),
    });

    if (!completedAppointment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "You must have a completed appointment with this doctor to leave a review",
            code: "FORBIDDEN",
          },
        },
        { status: StatusCodes.FORBIDDEN }
      );
    }

    // Check if review already exists
    const existingReview = await db.query.reviews.findFirst({
      where: and(eq(reviews.doctorId, doctorId), eq(reviews.personId, person.id)),
    });

    let review;

    if (existingReview) {
      // Update existing review
      [review] = await db
        .update(reviews)
        .set({
          score: validatedData.score,
          description: validatedData.description || null,
          appointmentId: completedAppointment.id, // Update to latest appointment
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, existingReview.id))
        .returning();
    } else {
      // Create new review
      [review] = await db
        .insert(reviews)
        .values({
          doctorId,
          personId: person.id,
          appointmentId: completedAppointment.id,
          score: validatedData.score,
          description: validatedData.description || null,
        })
        .returning();
    }

    // Fetch complete review data with relations
    const completeReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, review.id),
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
        person: {
          columns: {
            id: true,
            firstName: true,
            middleName: true,
            firstLastName: true,
            secondLastName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: completeReview,
        message: existingReview ? "Review updated successfully" : "Review created successfully",
      },
      { status: existingReview ? StatusCodes.OK : StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating/updating review:", error);
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
