import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import { validateBody, validateSearchParams } from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import {
  createAppointmentSchema,
  listAppointmentsSchema,
} from "@/lib/api/schemas/appointment.schemas";
import { Role } from "@/src/types";
import {
  findAllAppointments,
  findPersonByUserId,
  findDoctorByUserId,
  findAppointmentById,
} from "@/src/dal";
import db from "@/src/db";
import { appointments, payments, paymentMethodPersons, payoutMethods } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import {
  validateDoctorService,
  validateAppointmentSlot,
  calculateEndDateTime,
} from "@/utils/api/business-logic/appointment-validation";

/**
 * GET /api/appointments
 * List appointments with pagination and filters
 * Access:
 * - Patient: Own appointments only
 * - Doctor: Assigned appointments (their patients)
 * - Admin: All appointments
 */
export async function GET(request: NextRequest) {
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

  // Authorization
  const authzResult = await checkResourceAccess(userId, role, "appointment", "list");
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(
    request.nextUrl.searchParams,
    listAppointmentsSchema
  );
  if (!validationResult.success) return validationResult.error;
  const params = validationResult.data;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

  try {
    // Build filters based on role
    const filters: Record<string, any> = {
      doctorId: params.doctorId,
      personId: params.personId,
      status: params.status,
      startDate: params.startDate,
      endDate: params.endDate,
    };

    // Role-based filtering
    if (role === Role.PATIENT) {
      const person = await findPersonByUserId(userId);
      if (!person) {
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: calculatePaginationMetadata(page, limit, 0),
          },
          { status: StatusCodes.OK }
        );
      }
      filters.personId = person.id;
    } else if (role === Role.DOCTOR) {
      const doctor = await findDoctorByUserId(userId);
      if (!doctor) {
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: calculatePaginationMetadata(page, limit, 0),
          },
          { status: StatusCodes.OK }
        );
      }
      filters.doctorId = doctor.id;
    }
    // Admin sees all (no additional filter)

    // Get appointments using DAL
    const result = await findAllAppointments(filters, { page, limit, offset });

    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching appointments:", error);
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
 * POST /api/appointments
 * Create a new appointment with payment processing
 * Access:
 * - Patient: Create own appointment
 * - Admin: Create appointment for any patient
 *
 * Business logic:
 * 1. Validate doctor offers the service
 * 2. Validate time slot against doctor's schedule
 * 3. Check for overlapping appointments
 * 4. Validate payment method belongs to patient
 * 5. Create payment record
 * 6. Create appointment
 * 7. Use database transaction for atomicity
 */
export async function POST(request: NextRequest) {
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

  // Authorization
  const authzResult = await checkResourceAccess(userId, role, "appointment", "create");
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createAppointmentSchema);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

  try {
    // Get patient's person record
    const person = await findPersonByUserId(userId);

    if (!person) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Patient profile not found. Please create a profile first.",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Verify doctor exists and is active
    const { findDoctorById } = await import("@/src/dal");
    const doctor = await findDoctorById(validatedData.doctorId);

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

    if (!doctor.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctor is not currently accepting appointments",
            code: "BAD_REQUEST",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // Validate doctor offers the service and get pricing
    const serviceValidation = await validateDoctorService(
      validatedData.doctorId,
      validatedData.serviceId
    );

    if (!serviceValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: serviceValidation.error,
            code: "BAD_REQUEST",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const { price, duration } = serviceValidation;

    // Calculate end date/time
    const startDateTime = new Date(validatedData.startDateTime);
    const endDateTime = calculateEndDateTime(startDateTime, duration!);

    // Create appointment and payment in a transaction
    // All validations are done inside the transaction to prevent race conditions
    let result;
    try {
      result = await db.transaction(async (tx) => {
        // Validate appointment slot (schedule, overlaps, advance booking)
        // Done inside transaction to prevent double-booking
        const slotValidation = await validateAppointmentSlot({
          doctorId: validatedData.doctorId,
          startDateTime,
          endDateTime,
        });

        if (!slotValidation.success) {
          tx.rollback();
          return { error: slotValidation.error, code: "BAD_REQUEST" };
        }

        // Verify payment method belongs to patient
        const paymentMethod = await tx.query.paymentMethodPersons.findFirst({
          where: and(
            eq(paymentMethodPersons.id, validatedData.paymentMethodId),
            eq(paymentMethodPersons.personId, person.id)
          ),
        });

        if (!paymentMethod) {
          tx.rollback();
          return {
            error: "Payment method not found or does not belong to you",
            code: "NOT_FOUND",
          };
        }

        // Get doctor's preferred payout method
        const preferredPayoutMethod = await tx.query.payoutMethods.findFirst({
          where: and(
            eq(payoutMethods.doctorId, validatedData.doctorId),
            eq(payoutMethods.isPreferred, true)
          ),
        });

        if (!preferredPayoutMethod) {
          tx.rollback();
          return {
            error: "Doctor does not have a preferred payout method configured",
            code: "BAD_REQUEST",
          };
        }

        // Create payment record
        const [payment] = await tx
          .insert(payments)
          .values({
            personId: person.id,
            paymentMethodId: validatedData.paymentMethodId,
            payoutMethodId: preferredPayoutMethod.id,
            amount: price!.toString(),
            date: new Date().toISOString().split("T")[0], // Current date
          })
          .returning();

        // Create appointment
        const [appointment] = await tx
          .insert(appointments)
          .values({
            personId: person.id,
            doctorId: validatedData.doctorId,
            doctorServiceDoctorId: validatedData.doctorId,
            doctorServiceServiceId: validatedData.serviceId,
            paymentId: payment.id,
            startDateTime,
            endDateTime,
            status: "scheduled",
            notes: validatedData.notes || null,
          })
          .returning();

        return { appointment, payment };
      });
    } catch (error) {
      console.error("Error in appointment transaction:", error);
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Failed to create appointment",
            code: "INTERNAL_ERROR",
          },
        },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      );
    }

    // Check if transaction returned an error
    if ("error" in result) {
      const statusCode =
        result.code === "NOT_FOUND" ? StatusCodes.NOT_FOUND : StatusCodes.BAD_REQUEST;
      return NextResponse.json(
        {
          success: false,
          error: {
            message: result.error,
            code: result.code,
          },
        },
        { status: statusCode }
      );
    }

    // Fetch complete appointment data with relations
    const completeAppointment = await findAppointmentById(result.appointment.id);

    return NextResponse.json(
      {
        success: true,
        data: completeAppointment,
        message: "Appointment created successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
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
