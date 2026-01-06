import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/utils/api/middleware/auth";
import { checkResourceAccess } from "@/utils/api/authorization/guards";
import {
  validateParams,
  validateSearchParams,
  validateBody,
} from "@/utils/api/middleware/validation";
import { withRateLimit, defaultRateLimit, strictRateLimit } from "@/utils/api/middleware/ratelimit";
import { idParamSchema, paginationSchema } from "@/lib/api/schemas/common.schemas";
import { createProgressSchema } from "@/lib/api/schemas/simple.schemas";
import { Role } from "@/types/enums";
import db from "@/src/db";
import { persons, progresses, conditions, appointments, doctors } from "@/src/db/schema";
import { and, count, eq } from "drizzle-orm";
import { StatusCodes } from "http-status-codes";
import { getPaginationParams, calculatePaginationMetadata } from "@/utils/api/pagination/paginate";

/**
 * GET /api/persons/[id]/progresses
 * List all progress records for a person (read-only)
 * Access:
 * - Patient: Own progress records only
 * - Doctor: Assigned patients' progress records
 * - Admin: No progress records (as is sensitive data)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to parent person
  const authzResult = await checkResourceAccess(userId, role as Role, "person", "read", personId);
  if (!authzResult.allowed) return authzResult.error;

  // Validate query parameters
  const validationResult = validateSearchParams(request.nextUrl.searchParams, paginationSchema);
  if (!validationResult.success) return validationResult.error;

  // Get pagination params
  const { page, limit, offset } = getPaginationParams(request.nextUrl.searchParams);

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

    // If requester is a doctor, get their doctor record to filter progress records
    let doctorId: number | undefined;
    if (role === Role.DOCTOR) {
      const doctor = await db.query.doctors.findFirst({
        where: eq(doctors.userId, userId),
      });
      if (doctor) {
        doctorId = doctor.id;
      }
    }

    // Build where conditions
    const whereConditions = [eq(progresses.personId, personId)];
    // If doctor, only show progress records they created
    if (doctorId !== undefined) {
      whereConditions.push(eq(progresses.doctorId, doctorId));
    }

    // Get total count
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(progresses)
      .where(and(...whereConditions));

    // Get paginated progress records with condition, appointment, and doctor details
    // Join with doctors table using progresses.doctorId (the doctor who created the progress)
    const personProgresses = await db
      .select({
        id: progresses.id,
        personId: progresses.personId,
        doctorId: progresses.doctorId,
        appointmentId: progresses.appointmentId,
        conditionId: progresses.conditionId,
        title: progresses.title,
        level: progresses.level,
        notes: progresses.notes,
        createdAt: progresses.createdAt,
        condition: {
          id: conditions.id,
          name: conditions.name,
        },
        appointment: {
          id: appointments.id,
          doctorId: appointments.doctorId,
          startDateTime: appointments.startDateTime,
          endDateTime: appointments.endDateTime,
          status: appointments.status,
        },
        doctor: {
          id: doctors.id,
          firstName: doctors.firstName,
          middleName: doctors.middleName,
          firstLastName: doctors.firstLastName,
          secondLastName: doctors.secondLastName,
        },
      })
      .from(progresses)
      .leftJoin(conditions, eq(progresses.conditionId, conditions.id))
      .leftJoin(appointments, eq(progresses.appointmentId, appointments.id))
      .leftJoin(doctors, eq(progresses.doctorId, doctors.id))
      .where(and(...whereConditions))
      .orderBy(progresses.createdAt)
      .limit(limit)
      .offset(offset);

    // Calculate pagination metadata
    const pagination = calculatePaginationMetadata(page, limit, totalCount);

    return NextResponse.json(
      {
        success: true,
        data: personProgresses,
        pagination,
      },
      { status: StatusCodes.OK }
    );
  } catch (error) {
    console.error("Error fetching person progress records:", error);
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
 * POST /api/persons/[id]/progresses
 * Create a new progress record for a person
 * Access:
 * - Patient: Cannot create progress records (doctors create them)
 * - Doctor: Can create progress records for assigned patients
 * - Admin: Cannot create progress records (as is sensitive data)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // Validate ID parameter
  const paramsValidationResult = validateParams(resolvedParams, idParamSchema);
  if (!paramsValidationResult.success) return paramsValidationResult.error;

  const personId = parseInt(paramsValidationResult.data.id);

  // Authorization - check access to create progress for this person
  const authzResult = await checkResourceAccess(
    userId,
    role as Role,
    "progress",
    "create",
    undefined,
    { personId }
  );
  if (!authzResult.allowed) return authzResult.error;

  // Get doctor record if requester is a doctor (required for creating progress)
  let doctorId: number | undefined;
  if (role === Role.DOCTOR) {
    const doctor = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
    });
    if (!doctor) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Doctor record not found",
            code: "NOT_FOUND",
          },
        },
        { status: StatusCodes.NOT_FOUND }
      );
    }
    doctorId = doctor.id;
  } else {
    // Only doctors can create progress records
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Only doctors can create progress records",
          code: "FORBIDDEN",
        },
      },
      { status: StatusCodes.FORBIDDEN }
    );
  }

  // Parse and validate request body
  const body = await request.json().catch(() => ({}));
  // Remove personId from schema validation since it comes from params
  const progressSchemaWithoutPersonId = createProgressSchema.omit({ personId: true });
  const bodyValidationResult = validateBody(body, progressSchemaWithoutPersonId);
  if (!bodyValidationResult.success) return bodyValidationResult.error;
  const validatedData = bodyValidationResult.data;

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

    // If appointmentId is provided, verify it belongs to this person and this doctor
    if (validatedData.appointmentId) {
      const appointment = await db.query.appointments.findFirst({
        where: and(
          eq(appointments.id, validatedData.appointmentId),
          eq(appointments.personId, personId),
          eq(appointments.doctorId, doctorId)
        ),
      });

      if (!appointment) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: "Appointment not found or does not belong to this person/doctor",
              code: "NOT_FOUND",
            },
          },
          { status: StatusCodes.NOT_FOUND }
        );
      }
    }

    // Create progress record with doctorId
    const [progress] = await db
      .insert(progresses)
      .values({
        ...validatedData,
        personId,
        doctorId,
      })
      .returning();

    // Fetch the created progress with related data
    const progressWithRelations = await db.query.progresses.findFirst({
      where: eq(progresses.id, progress.id),
      with: {
        condition: true,
        doctor: true,
        appointment: true,
      },
    });

    // Format response to match GET endpoint structure
    const responseData = {
      id: progressWithRelations!.id,
      personId: progressWithRelations!.personId,
      doctorId: progressWithRelations!.doctorId,
      appointmentId: progressWithRelations!.appointmentId,
      conditionId: progressWithRelations!.conditionId,
      title: progressWithRelations!.title,
      level: progressWithRelations!.level,
      notes: progressWithRelations!.notes,
      createdAt: progressWithRelations!.createdAt,
      condition: progressWithRelations!.condition
        ? {
            id: progressWithRelations!.condition.id,
            name: progressWithRelations!.condition.name,
          }
        : null,
      appointment: progressWithRelations!.appointment
        ? {
            id: progressWithRelations!.appointment.id,
            doctorId: progressWithRelations!.appointment.doctorId,
            startDateTime: progressWithRelations!.appointment.startDateTime,
            endDateTime: progressWithRelations!.appointment.endDateTime,
            status: progressWithRelations!.appointment.status,
          }
        : null,
      doctor: progressWithRelations!.doctor
        ? {
            id: progressWithRelations!.doctor.id,
            firstName: progressWithRelations!.doctor.firstName,
            middleName: progressWithRelations!.doctor.middleName,
            firstLastName: progressWithRelations!.doctor.firstLastName,
            secondLastName: progressWithRelations!.doctor.secondLastName,
          }
        : null,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: "Progress record created successfully",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (error) {
    console.error("Error creating progress record:", error);
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
