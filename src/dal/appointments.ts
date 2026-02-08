import db from "@/src/db";
import { appointments, payments } from "@/src/db/schema";
import { and, count, eq, gte, isNull, lte, gt, sql } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams, QueryOptions } from "./types";

// ============================================================================
// FILTERS
// ============================================================================

export interface AppointmentFilters {
  doctorId?: number;
  personId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface AppointmentQueryOptions<T = any> extends QueryOptions<T> {
  includePatient?: boolean;
  includeDoctor?: boolean;
  includeDoctorService?: boolean;
  includePayment?: boolean;
}

// ============================================================================
// CORE
// ============================================================================

export async function findAllAppointments<
  const T extends { [K in keyof typeof appointments.$inferSelect]?: boolean }
>(
  filters: AppointmentFilters,
  pagination: PaginationParams,
  options: AppointmentQueryOptions<T> = {}
) {
  const { page, limit, offset } = pagination;
  const {
    columns,
    includePatient = true,
    includeDoctor = true,
    includeDoctorService = true,
    includePayment = true,
  } = options;

  const conditions = [];

  if (filters.personId) {
    conditions.push(eq(appointments.personId, filters.personId));
  }
  if (filters.doctorId) {
    conditions.push(eq(appointments.doctorId, filters.doctorId));
  }
  if (filters.status) {
    conditions.push(eq(appointments.status, filters.status as any));
  }
  if (filters.startDate) {
    conditions.push(gte(appointments.startDateTime, new Date(filters.startDate)));
  }
  if (filters.endDate) {
    conditions.push(lte(appointments.startDateTime, new Date(filters.endDate)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countQuery = db.select({ count: count() }).from(appointments);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const queryOptions: any = {
    where: whereClause,
    limit,
    offset,
    orderBy: (a: any, { desc }: any) => [desc(a.startDateTime)],
  };

  if (columns) {
    queryOptions.columns = columns;
  }

  const withOptions: any = {};
  if (includePatient) {
    withOptions.person = {
      columns: {
        id: true,
        firstName: true,
        middleName: true,
        firstLastName: true,
        secondLastName: true,
      },
    };
  }
  if (includeDoctor) {
    withOptions.doctor = {
      columns: {
        id: true,
        firstName: true,
        middleName: true,
        firstLastName: true,
        secondLastName: true,
      },
    };
  }
  if (includeDoctorService) {
    withOptions.doctorService = { with: { service: true } };
  }
  if (includePayment) {
    withOptions.payment = { columns: { id: true, amount: true, date: true } };
  }

  if (Object.keys(withOptions).length > 0) {
    queryOptions.with = withOptions;
  }

  const data = await db.query.appointments.findMany(queryOptions);

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

/**
 * Find appointment by ID excluding soft-deleted, with full relations.
 * Used for GET single, post-update re-fetch, post-cancel re-fetch.
 */
export async function findAppointmentById(id: number) {
  return db.query.appointments.findFirst({
    where: and(eq(appointments.id, id), isNull(appointments.deletedAt)),
    with: {
      person: {
        columns: {
          id: true,
          firstName: true,
          middleName: true,
          firstLastName: true,
          secondLastName: true,
          ci: true,
          birthDate: true,
          address: true,
        },
        with: { place: true },
      },
      doctor: {
        columns: {
          id: true,
          firstName: true,
          middleName: true,
          firstLastName: true,
          secondLastName: true,
          biography: true,
        },
      },
      doctorService: { with: { service: true } },
      payment: { columns: { id: true, amount: true, date: true } },
      review: true,
    },
  });
}

/**
 * Find appointment by ID including soft-deleted records, without relations.
 * Used by DELETE route to check if appointment exists or is already soft-deleted.
 */
export async function findAppointmentByIdWithDeleted(id: number) {
  return db.query.appointments.findFirst({
    where: eq(appointments.id, id),
  });
}

/**
 * Find appointment by ID excluding soft-deleted, without relations.
 * Used for existence/status checks in PATCH and cancel flows.
 */
export async function findAppointmentByIdBasic(id: number) {
  return db.query.appointments.findFirst({
    where: and(eq(appointments.id, id), isNull(appointments.deletedAt)),
  });
}

/**
 * Find appointment belonging to a specific patient and doctor.
 * Used by progress creation/edit to verify appointment ownership.
 */
export async function findAppointmentForProgress(
  appointmentId: number,
  personId: number,
  doctorId: number
) {
  return db.query.appointments.findFirst({
    where: and(
      eq(appointments.id, appointmentId),
      eq(appointments.personId, personId),
      eq(appointments.doctorId, doctorId)
    ),
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create appointment and payment in a single transaction.
 * All validation (slot, payment method, payout method) should be done before calling this.
 */
export async function createAppointmentWithPayment(data: {
  personId: number;
  doctorId: number;
  doctorServiceDoctorId: number;
  doctorServiceServiceId: number;
  paymentMethodId: number;
  payoutMethodId: number;
  amount: string;
  startDateTime: Date;
  endDateTime: Date;
  notes?: string | null;
}) {
  return db.transaction(async (tx) => {
    const [payment] = await tx
      .insert(payments)
      .values({
        personId: data.personId,
        paymentMethodId: data.paymentMethodId,
        payoutMethodId: data.payoutMethodId,
        amount: data.amount,
        date: new Date().toISOString().split("T")[0],
      })
      .returning();

    const [appointment] = await tx
      .insert(appointments)
      .values({
        personId: data.personId,
        doctorId: data.doctorId,
        doctorServiceDoctorId: data.doctorServiceDoctorId,
        doctorServiceServiceId: data.doctorServiceServiceId,
        paymentId: payment.id,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        status: "scheduled",
        notes: data.notes || null,
      })
      .returning();

    return { appointment, payment };
  });
}

export async function editAppointment(id: number, data: Partial<typeof appointments.$inferInsert>) {
  const [appointment] = await db
    .update(appointments)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(appointments.id, id))
    .returning();
  return appointment;
}

export async function softDeleteAppointment(id: number) {
  const [appointment] = await db
    .update(appointments)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(appointments.id, id))
    .returning();
  return appointment;
}

/**
 * Atomically cancel an appointment.
 * When enforceAdvancePolicy is true, only cancels if the appointment
 * is at least 24 hours away (for patient cancellations).
 * Returns the cancelled appointment, or undefined if the 24h check failed.
 */
export async function cancelAppointment(
  id: number,
  cancellationReason: string,
  enforceAdvancePolicy: boolean
) {
  const conditions = [eq(appointments.id, id), isNull(appointments.deletedAt)];

  if (enforceAdvancePolicy) {
    conditions.push(gt(appointments.startDateTime, sql`NOW() + INTERVAL '24 hours'`));
  }

  const [cancelled] = await db
    .update(appointments)
    .set({
      status: "cancelled",
      cancellationReason,
      updatedAt: new Date(),
    })
    .where(and(...conditions))
    .returning();

  return cancelled;
}
