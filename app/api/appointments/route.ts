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
import { Role } from "@/types/enums";
import db from "@/src/db";
import { appointments, persons, doctors, payments, paymentMethodPersons } from "@/src/db/schema";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
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
  const authzResult = await checkResourceAccess(userId, role as Role, "appointment", "list");
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
    // Build WHERE clause with role-based filtering
    const conditions = [];

    // Role-based filtering
    if (role === Role.PATIENT) {
      // Patients see only their own appointments
      const person = await db.query.persons.findFirst({
        where: eq(persons.userId, userId),
      });

      if (person) {
        conditions.push(eq(appointments.personId, person.id));
      } else {
        // User is patient but has no person profile - return empty result
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: calculatePaginationMetadata(page, limit, 0),
          },
          { status: StatusCodes.OK }
        );
      }
    } else if (role === Role.DOCTOR) {
      // Doctors see appointments with their patients
      const doctor = await db.query.doctors.findFirst({
        where: eq(doctors.userId, userId),
      });

      if (doctor) {
        conditions.push(eq(appointments.doctorId, doctor.id));
      } else {
        // User is doctor but has no doctor profile - return empty result
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: calculatePaginationMetadata(page, limit, 0),
          },
          { status: StatusCodes.OK }
        );
      }
    }
    // Admin sees all (no additional filter)

    // Additional filters from params
    if (params.doctorId) {
      conditions.push(eq(appointments.doctorId, params.doctorId));
    }

    if (params.personId) {
      conditions.push(eq(appointments.personId, params.personId));
    }

    if (params.status) {
      conditions.push(eq(appointments.status, params.status));
    }

    if (params.startDate) {
      const startDate = new Date(params.startDate);
      conditions.push(gte(appointments.startDateTime, startDate));
    }

    if (params.endDate) {
      const endDate = new Date(params.endDate);
      conditions.push(lte(appointments.startDateTime, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countQuery = db.select({ count: count() }).from(appointments);
    if (whereClause) {
      countQuery.where(whereClause);
    }
    const [{ count: totalCount }] = await countQuery;

    // Get paginated data with relations
    const data = await db.query.appointments.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (appointments, { desc }) => [desc(appointments.startDateTime)],
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
        payment: {
          columns: {
            id: true,
            amount: true,
            date: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json(
      {
        success: true,
        data,
        pagination,
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
  const authzResult = await checkResourceAccess(userId, role as Role, "appointment", "create");
  if (!authzResult.allowed) return authzResult.error;

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  const bodyValidationResult = validateBody(body, createAppointmentSchema);
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
            message: "Patient profile not found. Please create a profile first.",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Verify doctor exists and is active
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.id, validatedData.doctorId),
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

    // Validate appointment slot (schedule, overlaps, advance booking)
    const slotValidation = await validateAppointmentSlot({
      doctorId: validatedData.doctorId,
      startDateTime,
      endDateTime,
    });

    if (!slotValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: slotValidation.error,
            code: "BAD_REQUEST",
          },
        },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    // Verify payment method belongs to patient
    const paymentMethod = await db.query.paymentMethodPersons.findFirst({
      where: and(
        eq(paymentMethodPersons.id, validatedData.paymentMethodId),
        eq(paymentMethodPersons.personId, person.id)
      ),
    });

    if (!paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Payment method not found or does not belong to you",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    // Create appointment and payment in a transaction
    const result = await db.transaction(async (tx) => {
      // Create payment record
      const [payment] = await tx
        .insert(payments)
        .values({
          personId: person.id,
          paymentMethodId: validatedData.paymentMethodId,
          payoutMethodId: 1, // TODO: Get doctor's payout method
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

    // Fetch complete appointment data with relations
    const completeAppointment = await db.query.appointments.findFirst({
      where: eq(appointments.id, result.appointment.id),
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
        payment: true,
      },
    });

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
