import db from "@/src/db";
import { payments, paymentMethods, appointments } from "@/src/db/schema";
import { and, count, eq, gte, inArray, lte } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams } from "./types";

// ============================================================================
// FILTERS
// ============================================================================

export interface PaymentFilters {
  personId?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ============================================================================
// CORE
// ============================================================================

export async function findAllPayments(
  filters: PaymentFilters,
  pagination: PaginationParams,
  restrictToPersonIds?: number[]
) {
  const { page, limit, offset } = pagination;

  const conditions = [];

  if (restrictToPersonIds) {
    if (restrictToPersonIds.length === 0)
      return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(inArray(payments.personId, restrictToPersonIds));
  }

  if (filters.personId) {
    conditions.push(eq(payments.personId, filters.personId));
  }
  if (filters.startDate) {
    conditions.push(gte(payments.date, filters.startDate));
  }
  if (filters.endDate) {
    conditions.push(lte(payments.date, filters.endDate));
  }
  if (filters.minAmount !== undefined) {
    conditions.push(gte(payments.amount, String(filters.minAmount)));
  }
  if (filters.maxAmount !== undefined) {
    conditions.push(lte(payments.amount, String(filters.maxAmount)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countQuery = db.select({ count: count() }).from(payments);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const data = await db
    .select({
      id: payments.id,
      personId: payments.personId,
      paymentMethodId: payments.paymentMethodId,
      payoutMethodId: payments.payoutMethodId,
      amount: payments.amount,
      date: payments.date,
      createdAt: payments.createdAt,
      updatedAt: payments.updatedAt,
      paymentMethod: {
        id: paymentMethods.id,
        type: paymentMethods.type,
        cardLast4: paymentMethods.cardLast4,
        cardHolderName: paymentMethods.cardHolderName,
        cardBrand: paymentMethods.cardBrand,
        pagoMovilPhone: paymentMethods.pagoMovilPhone,
        pagoMovilBankCode: paymentMethods.pagoMovilBankCode,
      },
    })
    .from(payments)
    .leftJoin(paymentMethods, eq(payments.paymentMethodId, paymentMethods.id))
    .where(whereClause)
    .orderBy(payments.date)
    .limit(limit)
    .offset(offset);

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findPaymentById(id: number) {
  const [payment] = await db
    .select({
      id: payments.id,
      personId: payments.personId,
      paymentMethodId: payments.paymentMethodId,
      payoutMethodId: payments.payoutMethodId,
      amount: payments.amount,
      date: payments.date,
      createdAt: payments.createdAt,
      updatedAt: payments.updatedAt,
      paymentMethod: {
        id: paymentMethods.id,
        type: paymentMethods.type,
        cardLast4: paymentMethods.cardLast4,
        cardHolderName: paymentMethods.cardHolderName,
        cardBrand: paymentMethods.cardBrand,
        pagoMovilPhone: paymentMethods.pagoMovilPhone,
        pagoMovilBankCode: paymentMethods.pagoMovilBankCode,
      },
    })
    .from(payments)
    .leftJoin(paymentMethods, eq(payments.paymentMethodId, paymentMethods.id))
    .where(eq(payments.id, id));

  return payment;
}

export async function findPaymentPersonId(id: number) {
  const [row] = await db
    .select({ personId: payments.personId })
    .from(payments)
    .where(eq(payments.id, id));
  return row?.personId;
}

export async function createPayment(data: typeof payments.$inferInsert) {
  const [payment] = await db.insert(payments).values(data).returning();
  return payment;
}

export async function findDoctorAssignedPatientIdsFromPayments(doctorId: number) {
  const rows = await db
    .selectDistinct({ personId: payments.personId })
    .from(payments)
    .innerJoin(appointments, eq(payments.id, appointments.paymentId))
    .where(eq(appointments.doctorId, doctorId));
  return rows.map((r) => r.personId);
}
