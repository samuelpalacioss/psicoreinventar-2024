import db from "@/src/db";
import {
  persons,
  places,
  phones,
  appointments,
  payments,
  paymentMethods,
  paymentMethodPersons,
  progresses,
} from "@/src/db/schema";
import { and, count, eq, gte, ilike, lte, or } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams } from "./types";

// ============================================================================
// FILTERS
// ============================================================================

export interface PersonFilters {
  search?: string;
  placeId?: number;
  isActive?: boolean;
}

// ============================================================================
// CORE
// ============================================================================

export async function findAllPersons(filters: PersonFilters, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;

  const conditions = [];

  if (filters.search) {
    conditions.push(
      or(
        ilike(persons.firstName, `%${filters.search}%`),
        ilike(persons.firstLastName, `%${filters.search}%`),
        ilike(persons.middleName, `%${filters.search}%`),
        ilike(persons.secondLastName, `%${filters.search}%`)
      )
    );
  }

  if (filters.placeId) {
    conditions.push(eq(persons.placeId, filters.placeId));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(persons.isActive, filters.isActive));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countQuery = db.select({ count: count() }).from(persons);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const dataQuery = db
    .select({
      id: persons.id,
      userId: persons.userId,
      ci: persons.ci,
      firstName: persons.firstName,
      middleName: persons.middleName,
      firstLastName: persons.firstLastName,
      secondLastName: persons.secondLastName,
      birthDate: persons.birthDate,
      address: persons.address,
      placeId: persons.placeId,
      isActive: persons.isActive,
      createdAt: persons.createdAt,
      updatedAt: persons.updatedAt,
      place: {
        id: places.id,
        name: places.name,
      },
    })
    .from(persons)
    .leftJoin(places, eq(persons.placeId, places.id))
    .limit(limit)
    .offset(offset);

  if (whereClause) dataQuery.where(whereClause);
  const data = await dataQuery;

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findPersonById(id: number) {
  return db.query.persons.findFirst({
    where: eq(persons.id, id),
    with: { place: true },
  });
}

export async function findPersonByUserId(userId: string) {
  return db.query.persons.findFirst({
    where: eq(persons.userId, userId),
  });
}

export async function findPersonByCi(ci: number) {
  return db.query.persons.findFirst({
    where: eq(persons.ci, ci),
  });
}

export async function createPerson(data: typeof persons.$inferInsert) {
  const [person] = await db.insert(persons).values(data).returning();
  return person;
}

export async function editPerson(id: number, data: Partial<typeof persons.$inferInsert>) {
  const [person] = await db
    .update(persons)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(persons.id, id))
    .returning();
  return person;
}

export async function deletePerson(id: number) {
  await db.delete(persons).where(eq(persons.id, id));
}

// ============================================================================
// PHONES
// ============================================================================

export async function findPersonPhones(personId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(phones.personId, personId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(phones)
    .where(whereClause);

  const data = await db.query.phones.findMany({ where: whereClause, limit, offset });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findPersonPhone(personId: number, phoneId: number) {
  return db.query.phones.findFirst({
    where: and(eq(phones.id, phoneId), eq(phones.personId, personId)),
  });
}

export async function createPersonPhone(
  personId: number,
  data: { areaCode: number; number: number }
) {
  const [phone] = await db
    .insert(phones)
    .values({ ...data, personId, doctorId: null })
    .returning();
  return phone;
}

export async function editPersonPhone(
  phoneId: number,
  data: { areaCode?: number; number?: number }
) {
  const [phone] = await db.update(phones).set(data).where(eq(phones.id, phoneId)).returning();
  return phone;
}

export async function deletePersonPhone(phoneId: number) {
  await db.delete(phones).where(eq(phones.id, phoneId));
}

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export async function findPersonPaymentMethods(personId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(paymentMethodPersons.personId, personId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(paymentMethodPersons)
    .where(whereClause);

  const data = await db.query.paymentMethodPersons.findMany({
    where: whereClause,
    limit,
    offset,
    with: { paymentMethod: true },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findPersonPaymentMethod(personId: number, methodId: number) {
  return db.query.paymentMethodPersons.findFirst({
    where: and(
      eq(paymentMethodPersons.id, methodId),
      eq(paymentMethodPersons.personId, personId)
    ),
    with: { paymentMethod: true },
  });
}

export async function createPersonPaymentMethod(
  personId: number,
  paymentMethodData: typeof paymentMethods.$inferInsert,
  associationData: { nickname: string; isPreferred?: boolean }
) {
  return db.transaction(async (tx) => {
    if (associationData.isPreferred) {
      await tx
        .update(paymentMethodPersons)
        .set({ isPreferred: false, updatedAt: new Date() })
        .where(
          and(
            eq(paymentMethodPersons.personId, personId),
            eq(paymentMethodPersons.isPreferred, true)
          )
        );
    }

    const [method] = await tx.insert(paymentMethods).values(paymentMethodData).returning();

    const [association] = await tx
      .insert(paymentMethodPersons)
      .values({
        personId,
        paymentMethodId: method.id,
        nickname: associationData.nickname,
        isPreferred: associationData.isPreferred ?? false,
      })
      .returning();

    return { paymentMethod: method, association };
  });
}

export async function editPersonPaymentMethod(
  methodId: number,
  paymentMethodId: number,
  personId: number,
  associationData?: Partial<{ nickname: string; isPreferred: boolean }>,
  paymentMethodData?: Partial<typeof paymentMethods.$inferInsert>
) {
  return db.transaction(async (tx) => {
    if (associationData?.isPreferred) {
      await tx
        .update(paymentMethodPersons)
        .set({ isPreferred: false, updatedAt: new Date() })
        .where(
          and(
            eq(paymentMethodPersons.personId, personId),
            eq(paymentMethodPersons.isPreferred, true)
          )
        );
    }

    if (associationData) {
      await tx
        .update(paymentMethodPersons)
        .set({ ...associationData, updatedAt: new Date() })
        .where(eq(paymentMethodPersons.id, methodId));
    }

    if (paymentMethodData) {
      await tx
        .update(paymentMethods)
        .set({ ...paymentMethodData, updatedAt: new Date() })
        .where(eq(paymentMethods.id, paymentMethodId));
    }

    return tx.query.paymentMethodPersons.findFirst({
      where: eq(paymentMethodPersons.id, methodId),
      with: { paymentMethod: true },
    });
  });
}

export async function deletePersonPaymentMethod(methodId: number, paymentMethodId: number) {
  await db.transaction(async (tx) => {
    await tx.delete(paymentMethodPersons).where(eq(paymentMethodPersons.id, methodId));
    await tx.delete(paymentMethods).where(eq(paymentMethods.id, paymentMethodId));
  });
}

// ============================================================================
// READ-ONLY: APPOINTMENTS, PAYMENTS, PROGRESSES
// ============================================================================

export async function findPatientAppointments(personId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(appointments.personId, personId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(appointments)
    .where(whereClause);

  const data = await db.query.appointments.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (a, { desc }) => [desc(a.startDateTime)],
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
      doctorService: { with: { service: true } },
      payment: { columns: { id: true, amount: true, date: true } },
    },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findPatientPayments(
  personId: number,
  pagination: PaginationParams,
  filters?: { startDate?: string; endDate?: string }
) {
  const { page, limit, offset } = pagination;

  const conditions = [eq(payments.personId, personId)];
  if (filters?.startDate) {
    conditions.push(gte(payments.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(payments.date, filters.endDate));
  }

  const whereClause = and(...conditions);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(payments)
    .where(whereClause);

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

export async function findPatientProgresses(personId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(progresses.personId, personId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(progresses)
    .where(whereClause);

  const data = await db.query.progresses.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (p, { desc }) => [desc(p.createdAt)],
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
      appointment: { columns: { id: true, startDateTime: true, status: true } },
      condition: { columns: { id: true, name: true } },
    },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}
