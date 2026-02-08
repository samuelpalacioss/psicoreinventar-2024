import db from "@/src/db";
import {
  doctors,
  places,
  phones,
  schedules,
  educations,
  ageGroups,
  doctorServices,
  doctorConditions,
  doctorLanguages,
  doctorTreatmentMethods,
  payoutMethods,
  appointments,
  reviews,
  conditions as conditionsTable,
} from "@/src/db/schema";
import { and, count, eq, ilike, or, sql } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams } from "./types";

// ============================================================================
// FILTERS
// ============================================================================

export interface DoctorFilters {
  search?: string;
  placeId?: number;
  isActive?: boolean;
  serviceId?: number;
  conditionId?: number;
  languageId?: number;
  treatmentMethodId?: number;
}

// ============================================================================
// CORE
// ============================================================================

export async function findAllDoctors(
  filters: DoctorFilters,
  pagination: PaginationParams,
  restrictToIds?: number[]
) {
  const { page, limit, offset } = pagination;

  const conditions = [];

  if (restrictToIds) {
    if (restrictToIds.length === 0) return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(sql`${doctors.id} IN (${sql.join(restrictToIds, sql.raw(","))})`);
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(doctors.firstName, `%${filters.search}%`),
        ilike(doctors.firstLastName, `%${filters.search}%`),
        ilike(doctors.middleName, `%${filters.search}%`),
        ilike(doctors.secondLastName, `%${filters.search}%`),
        ilike(doctors.biography, `%${filters.search}%`)
      )
    );
  }

  if (filters.placeId) {
    conditions.push(eq(doctors.placeId, filters.placeId));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(doctors.isActive, filters.isActive));
  }

  // M2M filters: resolve doctor IDs from junction tables
  if (filters.serviceId) {
    const rows = await db
      .selectDistinct({ doctorId: doctorServices.doctorId })
      .from(doctorServices)
      .where(eq(doctorServices.serviceId, filters.serviceId));
    if (rows.length === 0) return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(sql`${doctors.id} IN (${sql.join(rows.map((r) => r.doctorId), sql.raw(","))})`);
  }

  if (filters.conditionId) {
    const rows = await db
      .selectDistinct({ doctorId: doctorConditions.doctorId })
      .from(doctorConditions)
      .where(eq(doctorConditions.conditionId, filters.conditionId));
    if (rows.length === 0) return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(sql`${doctors.id} IN (${sql.join(rows.map((r) => r.doctorId), sql.raw(","))})`);
  }

  if (filters.languageId) {
    const rows = await db
      .selectDistinct({ doctorId: doctorLanguages.doctorId })
      .from(doctorLanguages)
      .where(eq(doctorLanguages.languageId, filters.languageId));
    if (rows.length === 0) return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(sql`${doctors.id} IN (${sql.join(rows.map((r) => r.doctorId), sql.raw(","))})`);
  }

  if (filters.treatmentMethodId) {
    const rows = await db
      .selectDistinct({ doctorId: doctorTreatmentMethods.doctorId })
      .from(doctorTreatmentMethods)
      .where(eq(doctorTreatmentMethods.treatmentMethodId, filters.treatmentMethodId));
    if (rows.length === 0) return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(sql`${doctors.id} IN (${sql.join(rows.map((r) => r.doctorId), sql.raw(","))})`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countQuery = db.select({ count: count() }).from(doctors);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const dataQuery = db
    .select({
      id: doctors.id,
      userId: doctors.userId,
      ci: doctors.ci,
      firstName: doctors.firstName,
      middleName: doctors.middleName,
      firstLastName: doctors.firstLastName,
      secondLastName: doctors.secondLastName,
      birthDate: doctors.birthDate,
      address: doctors.address,
      placeId: doctors.placeId,
      biography: doctors.biography,
      firstSessionExpectation: doctors.firstSessionExpectation,
      biggestStrengths: doctors.biggestStrengths,
      isActive: doctors.isActive,
      createdAt: doctors.createdAt,
      updatedAt: doctors.updatedAt,
      place: {
        id: places.id,
        name: places.name,
      },
    })
    .from(doctors)
    .leftJoin(places, eq(doctors.placeId, places.id))
    .limit(limit)
    .offset(offset);

  if (whereClause) dataQuery.where(whereClause);
  const data = await dataQuery;

  // If no doctors found, return early
  if (data.length === 0) {
    return { data: [], pagination: calculatePaginationMetadata(page, limit, totalCount) };
  }

  // Fetch aggregated stats for each doctor
  const doctorIds = data.map((d) => d.id);

  // Get review stats for all doctors
  const reviewStats = await db
    .select({
      doctorId: reviews.doctorId,
      averageScore: sql<number>`COALESCE(AVG(${reviews.score}), 0)`,
      totalReviews: count(reviews.id),
    })
    .from(reviews)
    .where(sql`${reviews.doctorId} IN (${sql.join(doctorIds, sql.raw(","))})`)
    .groupBy(reviews.doctorId);

  // Get conditions for all doctors
  const doctorConditionsData = await db
    .select({
      doctorId: doctorConditions.doctorId,
      conditionId: doctorConditions.conditionId,
      conditionName: conditionsTable.name,
    })
    .from(doctorConditions)
    .leftJoin(conditionsTable, eq(doctorConditions.conditionId, conditionsTable.id))
    .where(sql`${doctorConditions.doctorId} IN (${sql.join(doctorIds, sql.raw(","))})`);

  // Map stats to doctors
  const reviewStatsMap = new Map(reviewStats.map((r) => [r.doctorId, r]));
  const conditionsMap = new Map<number, string[]>();

  doctorConditionsData.forEach((dc) => {
    if (!conditionsMap.has(dc.doctorId)) {
      conditionsMap.set(dc.doctorId, []);
    }
    if (dc.conditionName) {
      conditionsMap.get(dc.doctorId)!.push(dc.conditionName);
    }
  });

  // Enrich data with stats
  const enrichedData = data.map((doctor) => ({
    ...doctor,
    stats: {
      averageScore: reviewStatsMap.get(doctor.id)?.averageScore || 0,
      totalReviews: reviewStatsMap.get(doctor.id)?.totalReviews || 0,
    },
    conditions: conditionsMap.get(doctor.id) || [],
  }));

  return { data: enrichedData, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorById(id: number) {
  return db.query.doctors.findFirst({
    where: eq(doctors.id, id),
    with: {
      place: true,
      phones: true,
      educations: { with: { institution: true } },
      schedules: true,
      ageGroups: true,
      doctorServices: { with: { service: true } },
      doctorTreatmentMethods: { with: { treatmentMethod: true } },
      doctorConditions: { with: { condition: true } },
      doctorLanguages: { with: { language: true } },
    },
  });
}

export async function findDoctorByUserId(userId: string) {
  return db.query.doctors.findFirst({
    where: eq(doctors.userId, userId),
  });
}

export async function findDoctorByCi(ci: number) {
  return db.query.doctors.findFirst({
    where: eq(doctors.ci, ci),
  });
}

export async function createDoctor(data: typeof doctors.$inferInsert) {
  const [doctor] = await db.insert(doctors).values(data).returning();
  return doctor;
}

export async function editDoctor(id: number, data: Partial<typeof doctors.$inferInsert>) {
  const [doctor] = await db
    .update(doctors)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(doctors.id, id))
    .returning();
  return doctor;
}

export async function deleteDoctor(id: number) {
  await db.delete(doctors).where(eq(doctors.id, id));
}

// ============================================================================
// SERVICES
// ============================================================================

export async function findDoctorServices(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(doctorServices.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(doctorServices)
    .where(whereClause);

  const data = await db.query.doctorServices.findMany({
    where: whereClause,
    limit,
    offset,
    with: { service: true },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorService(doctorId: number, serviceId: number) {
  return db.query.doctorServices.findFirst({
    where: and(eq(doctorServices.doctorId, doctorId), eq(doctorServices.serviceId, serviceId)),
  });
}

export async function createDoctorService(
  doctorId: number,
  serviceId: number,
  amount: number
) {
  const [doctorService] = await db
    .insert(doctorServices)
    .values({ doctorId, serviceId, amount })
    .returning();
  return doctorService;
}

export async function editDoctorService(
  doctorId: number,
  serviceId: number,
  data: { amount: number }
) {
  const [updated] = await db
    .update(doctorServices)
    .set(data)
    .where(and(eq(doctorServices.doctorId, doctorId), eq(doctorServices.serviceId, serviceId)))
    .returning();
  return updated;
}

export async function deleteDoctorService(doctorId: number, serviceId: number) {
  await db
    .delete(doctorServices)
    .where(and(eq(doctorServices.doctorId, doctorId), eq(doctorServices.serviceId, serviceId)));
}

// ============================================================================
// PHONES
// ============================================================================

export async function findDoctorPhones(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(phones.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(phones)
    .where(whereClause);

  const data = await db.query.phones.findMany({ where: whereClause, limit, offset });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorPhone(doctorId: number, phoneId: number) {
  return db.query.phones.findFirst({
    where: and(eq(phones.id, phoneId), eq(phones.doctorId, doctorId)),
  });
}

export async function createDoctorPhone(doctorId: number, data: { areaCode: number; number: number }) {
  const [phone] = await db
    .insert(phones)
    .values({ ...data, doctorId, personId: null })
    .returning();
  return phone;
}

export async function editDoctorPhone(phoneId: number, data: { areaCode?: number; number?: number }) {
  const [phone] = await db.update(phones).set(data).where(eq(phones.id, phoneId)).returning();
  return phone;
}

export async function deleteDoctorPhone(phoneId: number) {
  await db.delete(phones).where(eq(phones.id, phoneId));
}

// ============================================================================
// SCHEDULES
// ============================================================================

export async function findDoctorSchedules(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(schedules.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(schedules)
    .where(whereClause);

  const data = await db.query.schedules.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (s, { asc }) => [asc(s.day), asc(s.startTime)],
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorSchedule(doctorId: number, scheduleId: number) {
  return db.query.schedules.findFirst({
    where: and(eq(schedules.id, scheduleId), eq(schedules.doctorId, doctorId)),
  });
}

export async function createDoctorSchedule(
  doctorId: number,
  data: Omit<typeof schedules.$inferInsert, "doctorId">
) {
  const [schedule] = await db
    .insert(schedules)
    .values({ ...data, doctorId })
    .returning();
  return schedule;
}

export async function editDoctorSchedule(
  scheduleId: number,
  data: Partial<typeof schedules.$inferInsert>
) {
  const [schedule] = await db
    .update(schedules)
    .set(data)
    .where(eq(schedules.id, scheduleId))
    .returning();
  return schedule;
}

export async function deleteDoctorSchedule(scheduleId: number) {
  await db.delete(schedules).where(eq(schedules.id, scheduleId));
}

// ============================================================================
// CONDITIONS (M2M)
// ============================================================================

export async function findDoctorConditions(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(doctorConditions.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(doctorConditions)
    .where(whereClause);

  const data = await db.query.doctorConditions.findMany({
    where: whereClause,
    limit,
    offset,
    with: { condition: true },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorCondition(doctorId: number, conditionId: number) {
  return db.query.doctorConditions.findFirst({
    where: and(
      eq(doctorConditions.doctorId, doctorId),
      eq(doctorConditions.conditionId, conditionId)
    ),
  });
}

export async function createDoctorCondition(
  doctorId: number,
  conditionId: number,
  type: string
) {
  const [row] = await db
    .insert(doctorConditions)
    .values({ doctorId, conditionId, type: type as any })
    .returning();
  return row;
}

export async function deleteDoctorCondition(doctorId: number, conditionId: number) {
  await db
    .delete(doctorConditions)
    .where(
      and(eq(doctorConditions.doctorId, doctorId), eq(doctorConditions.conditionId, conditionId))
    );
}

// ============================================================================
// LANGUAGES (M2M)
// ============================================================================

export async function findDoctorLanguages(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(doctorLanguages.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(doctorLanguages)
    .where(whereClause);

  const data = await db.query.doctorLanguages.findMany({
    where: whereClause,
    limit,
    offset,
    with: { language: true },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorLanguage(doctorId: number, languageId: number) {
  return db.query.doctorLanguages.findFirst({
    where: and(
      eq(doctorLanguages.doctorId, doctorId),
      eq(doctorLanguages.languageId, languageId)
    ),
  });
}

export async function createDoctorLanguage(
  doctorId: number,
  languageId: number,
  type: string
) {
  const [row] = await db
    .insert(doctorLanguages)
    .values({ doctorId, languageId, type: type as any })
    .returning();
  return row;
}

export async function deleteDoctorLanguage(doctorId: number, languageId: number) {
  await db
    .delete(doctorLanguages)
    .where(
      and(eq(doctorLanguages.doctorId, doctorId), eq(doctorLanguages.languageId, languageId))
    );
}

// ============================================================================
// TREATMENT METHODS (M2M)
// ============================================================================

export async function findDoctorTreatmentMethods(
  doctorId: number,
  pagination: PaginationParams
) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(doctorTreatmentMethods.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(doctorTreatmentMethods)
    .where(whereClause);

  const data = await db.query.doctorTreatmentMethods.findMany({
    where: whereClause,
    limit,
    offset,
    with: { treatmentMethod: true },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorTreatmentMethod(doctorId: number, treatmentMethodId: number) {
  return db.query.doctorTreatmentMethods.findFirst({
    where: and(
      eq(doctorTreatmentMethods.doctorId, doctorId),
      eq(doctorTreatmentMethods.treatmentMethodId, treatmentMethodId)
    ),
  });
}

export async function createDoctorTreatmentMethod(
  doctorId: number,
  treatmentMethodId: number
) {
  const [row] = await db
    .insert(doctorTreatmentMethods)
    .values({ doctorId, treatmentMethodId })
    .returning();
  return row;
}

export async function deleteDoctorTreatmentMethod(
  doctorId: number,
  treatmentMethodId: number
) {
  await db
    .delete(doctorTreatmentMethods)
    .where(
      and(
        eq(doctorTreatmentMethods.doctorId, doctorId),
        eq(doctorTreatmentMethods.treatmentMethodId, treatmentMethodId)
      )
    );
}

// ============================================================================
// AGE GROUPS
// ============================================================================

export async function findDoctorAgeGroups(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(ageGroups.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(ageGroups)
    .where(whereClause);

  const data = await db.query.ageGroups.findMany({ where: whereClause, limit, offset });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorAgeGroup(doctorId: number, ageGroupId: number) {
  return db.query.ageGroups.findFirst({
    where: and(eq(ageGroups.id, ageGroupId), eq(ageGroups.doctorId, doctorId)),
  });
}

export async function createDoctorAgeGroup(
  doctorId: number,
  data: Omit<typeof ageGroups.$inferInsert, "doctorId">
) {
  const [ageGroup] = await db
    .insert(ageGroups)
    .values({ ...data, doctorId })
    .returning();
  return ageGroup;
}

export async function editDoctorAgeGroup(
  ageGroupId: number,
  data: Partial<typeof ageGroups.$inferInsert>
) {
  const [ageGroup] = await db
    .update(ageGroups)
    .set(data)
    .where(eq(ageGroups.id, ageGroupId))
    .returning();
  return ageGroup;
}

export async function deleteDoctorAgeGroup(ageGroupId: number) {
  await db.delete(ageGroups).where(eq(ageGroups.id, ageGroupId));
}

// ============================================================================
// EDUCATIONS
// ============================================================================

export async function findDoctorEducations(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(educations.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(educations)
    .where(whereClause);

  const data = await db.query.educations.findMany({
    where: whereClause,
    limit,
    offset,
    with: { institution: true },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorEducation(doctorId: number, educationId: number) {
  return db.query.educations.findFirst({
    where: and(eq(educations.id, educationId), eq(educations.doctorId, doctorId)),
    with: { institution: true },
  });
}

export async function createDoctorEducation(
  doctorId: number,
  data: Omit<typeof educations.$inferInsert, "doctorId">
) {
  const [education] = await db
    .insert(educations)
    .values({ ...data, doctorId })
    .returning();
  return education;
}

export async function editDoctorEducation(
  educationId: number,
  data: Partial<typeof educations.$inferInsert>
) {
  const [education] = await db
    .update(educations)
    .set(data)
    .where(eq(educations.id, educationId))
    .returning();
  return education;
}

export async function deleteDoctorEducation(educationId: number) {
  await db.delete(educations).where(eq(educations.id, educationId));
}

// ============================================================================
// PAYOUT METHODS
// ============================================================================

export async function findDoctorPayoutMethods(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(payoutMethods.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(payoutMethods)
    .where(whereClause);

  const data = await db.query.payoutMethods.findMany({ where: whereClause, limit, offset });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorPayoutMethod(doctorId: number, methodId: number) {
  return db.query.payoutMethods.findFirst({
    where: and(eq(payoutMethods.id, methodId), eq(payoutMethods.doctorId, doctorId)),
  });
}

export async function findDoctorPreferredPayoutMethod(doctorId: number) {
  return db.query.payoutMethods.findFirst({
    where: and(eq(payoutMethods.doctorId, doctorId), eq(payoutMethods.isPreferred, true)),
  });
}

export async function createDoctorPayoutMethod(
  doctorId: number,
  data: Omit<typeof payoutMethods.$inferInsert, "doctorId">
) {
  // If setting as preferred, unset existing preferred
  if (data.isPreferred) {
    await db
      .update(payoutMethods)
      .set({ isPreferred: false, updatedAt: new Date() })
      .where(and(eq(payoutMethods.doctorId, doctorId), eq(payoutMethods.isPreferred, true)));
  }

  const [method] = await db
    .insert(payoutMethods)
    .values({ ...data, doctorId })
    .returning();
  return method;
}

export async function editDoctorPayoutMethod(
  doctorId: number,
  methodId: number,
  data: Partial<typeof payoutMethods.$inferInsert>
) {
  // If setting as preferred, unset existing preferred
  if (data.isPreferred) {
    await db
      .update(payoutMethods)
      .set({ isPreferred: false, updatedAt: new Date() })
      .where(and(eq(payoutMethods.doctorId, doctorId), eq(payoutMethods.isPreferred, true)));
  }

  const [method] = await db
    .update(payoutMethods)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(payoutMethods.id, methodId))
    .returning();
  return method;
}

export async function deleteDoctorPayoutMethod(methodId: number) {
  await db.delete(payoutMethods).where(eq(payoutMethods.id, methodId));
}

// ============================================================================
// READ-ONLY: APPOINTMENTS & REVIEWS
// ============================================================================

export async function findDoctorAppointments(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(appointments.doctorId, doctorId);

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
      person: {
        columns: { id: true, firstName: true, middleName: true, firstLastName: true, secondLastName: true },
      },
      doctorService: { with: { service: true } },
      payment: { columns: { id: true, amount: true, date: true } },
    },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorReviews(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(reviews.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(reviews)
    .where(whereClause);

  const data = await db.query.reviews.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (r, { desc }) => [desc(r.createdAt)],
    with: {
      person: {
        columns: { id: true, firstName: true, middleName: true, firstLastName: true, secondLastName: true },
      },
    },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}
