import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody } from "@/utils/api/middleware/validation";
import { withRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { createReviewSchema } from "@/lib/api/schemas/appointment.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { appointments, reviews, persons } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";

/**
 * POST /api/appointments/[id]/review
 * Create a review for a completed appointment
 * Access:
 * - Patient only (must own the appointment)
 *
 * Business rules:
 * - Appointment must be completed
 * - Only patient can create review
 * - One review per appointment (unique constraint)
 * - Score must be between 1-5
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Rate limiting (strict for mutations)
  const rateLimitResponse = await withRateLimit(request, strictRateLimit);
  if (rateLimitResponse) return rateLimitResponse;

  const resolvedParams = await params;

  // Validate ID
  const appointmentId = parseInt(resolvedParams.id);
  if (isNaN(appointmentId)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid appointment ID",
          code: "VALIDATION_ERROR",
        },
      },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

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

    // Check if appointment exists and belongs to patient
    const appointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, appointmentId),
      with: {
        person: true,
        doctor: true,
        review: true, // Check if review already exists
      },
    });

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Appointment not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Verify appointment belongs to the patient
    if (appointment.personId !== person.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "You do not have permission to review this appointment",
            code: "FORBIDDEN",
          },
        },
        { status: StatusCodes.FORBIDDEN }
      );
    }

    // Check if appointment is completed
    if (appointment.status !== "completed") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Only completed appointments can be reviewed",
            code: "BAD_REQUEST",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // Check if review already exists
    if (appointment.review) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "This appointment has already been reviewed",
            code: "CONFLICT",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

    // Create review
    const [review] = await db
      .insert(reviews)
      .values({
        appointmentId,
        score: validatedData.score,
        description: validatedData.description || null,
      })
      .returning();

    // Fetch complete review data with relations
    const completeReview = await db.query.reviews.findFirst({
      where: eq(reviews.id, review.id),
      with: {
        appointment: {
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
            doctor: {
              columns: {
                id: true,
                firstName: true,
                middleName: true,
                firstLastName: true,
                secondLastName: true,
              },
            },
            doctorService: {
              with: {
                service: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: completeReview,
        message: "Review created successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating review:", error);

    // Handle unique constraint violation (review already exists)
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "This appointment has already been reviewed",
            code: "CONFLICT",
          },
        },
        { status: StatusCodes.CONFLICT }
      );
    }

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
