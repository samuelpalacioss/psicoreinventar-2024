import db from "@/src/db";
import {
  doctors,
  phones,
  schedules,
  educations,
  ageGroups,
  doctorServices,
  doctorConditions,
  doctorLanguages,
  payoutMethods,
  appointments,
  reviews,
  conditions as conditionsTable,
  services as servicesTable,
  places,
  identities,
  personalityTraits,
  doctorIdentities,
  doctorPersonalityTraits,
  consultationTypeEnum,
} from "@/src/db/schema";
import { and, count, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams, QueryOptions } from "./types";
import type { Service } from "@/src/types";

// ============================================================================
// FILTERS
// ============================================================================

export interface DoctorFilters {
  search?: string;
  placeId?: number;
  placeState?: string;
  isActive?: boolean;
  consultationType?: (typeof consultationTypeEnum.enumValues)[number];
  payoutType?: string;
  serviceId?: number;
  serviceNames?: Service[];
  conditionId?: number;
  conditionNames?: string[];
  languageId?: number;
}

export interface DoctorQueryOptions<T = any> extends QueryOptions<T> {
  includePlace?: boolean;
  includeStats?: boolean;
  includeConditions?: boolean;
}

// ============================================================================
// CORE
// ============================================================================

export async function findAllDoctors<
  const T extends { [K in keyof typeof doctors.$inferSelect]?: boolean }
>(
  filters: DoctorFilters,
  pagination: PaginationParams,
  restrictToIds?: number[],
  options: DoctorQueryOptions<T> = {}
) {
  const { page, limit, offset } = pagination;
  const { columns, includePlace, includeStats, includeConditions } = options;

  const conditions = [];

  if (restrictToIds) {
    if (restrictToIds.length === 0)
      return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
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

  if (filters.placeState) {
    const placeRows = await db
      .select({ id: places.id })
      .from(places)
      .where(ilike(places.state, filters.placeState));
    if (placeRows.length === 0)
      return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(
      sql`${doctors.placeId} IN (${sql.join(
        placeRows.map((r) => r.id),
        sql.raw(",")
      )})`
    );
  } else if (filters.placeId) {
    conditions.push(eq(doctors.placeId, filters.placeId));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(doctors.isActive, filters.isActive));
  }

  if (filters.consultationType) {
    // Inclusive filtering: when filtering by "virtual_only" or "in_person",
    // also show doctors who offer "both" options
    if (filters.consultationType === "virtual_only") {
      conditions.push(
        or(eq(doctors.consultationType, "virtual_only"), eq(doctors.consultationType, "both"))
      );
    } else if (filters.consultationType === "in_person") {
      conditions.push(
        or(eq(doctors.consultationType, "in_person"), eq(doctors.consultationType, "both"))
      );
    } else {
      // For "both", only show doctors who explicitly offer both
      conditions.push(eq(doctors.consultationType, filters.consultationType));
    }
  }

  if (filters.payoutType) {
    const rows = await db
      .selectDistinct({ doctorId: payoutMethods.doctorId })
      .from(payoutMethods)
      .where(eq(payoutMethods.type, filters.payoutType as any));
    if (rows.length === 0)
      return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(
      sql`${doctors.id} IN (${sql.join(
        rows.map((r) => r.doctorId),
        sql.raw(",")
      )})`
    );
  }

  // M2M filters: resolve doctor IDs from junction tables
  if (filters.serviceNames?.length) {
    const rows = await db
      .selectDistinct({ doctorId: doctorServices.doctorId })
      .from(doctorServices)
      .innerJoin(servicesTable, eq(doctorServices.serviceId, servicesTable.id))
      .where(inArray(servicesTable.name, filters.serviceNames));
    if (rows.length === 0)
      return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(
      sql`${doctors.id} IN (${sql.join(
        rows.map((r) => r.doctorId),
        sql.raw(",")
      )})`
    );
  } else if (filters.serviceId) {
    const rows = await db
      .selectDistinct({ doctorId: doctorServices.doctorId })
      .from(doctorServices)
      .where(eq(doctorServices.serviceId, filters.serviceId));
    if (rows.length === 0)
      return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(
      sql`${doctors.id} IN (${sql.join(
        rows.map((r) => r.doctorId),
        sql.raw(",")
      )})`
    );
  }

  if (filters.conditionNames?.length) {
    const rows = await db
      .selectDistinct({ doctorId: doctorConditions.doctorId })
      .from(doctorConditions)
      .innerJoin(conditionsTable, eq(doctorConditions.conditionId, conditionsTable.id))
      .where(inArray(conditionsTable.name, filters.conditionNames));
    if (rows.length === 0)
      return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(
      sql`${doctors.id} IN (${sql.join(
        rows.map((r) => r.doctorId),
        sql.raw(",")
      )})`
    );
  } else if (filters.conditionId) {
    const rows = await db
      .selectDistinct({ doctorId: doctorConditions.doctorId })
      .from(doctorConditions)
      .where(eq(doctorConditions.conditionId, filters.conditionId));
    if (rows.length === 0)
      return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(
      sql`${doctors.id} IN (${sql.join(
        rows.map((r) => r.doctorId),
        sql.raw(",")
      )})`
    );
  }

  if (filters.languageId) {
    const rows = await db
      .selectDistinct({ doctorId: doctorLanguages.doctorId })
      .from(doctorLanguages)
      .where(eq(doctorLanguages.languageId, filters.languageId));
    if (rows.length === 0)
      return { data: [], pagination: calculatePaginationMetadata(page, limit, 0) };
    conditions.push(
      sql`${doctors.id} IN (${sql.join(
        rows.map((r) => r.doctorId),
        sql.raw(",")
      )})`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countQuery = db.select({ count: count() }).from(doctors);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  // Use db.query with dynamic columns
  const queryOptions: any = {
    where: whereClause,
    limit,
    offset,
  };

  if (columns) {
    queryOptions.columns = columns;
  }

  queryOptions.with = {
    ...(includePlace && {
      place: {
        columns: {
          id: true,
          displayPlace: true,
        },
      },
    }),
    user: {
      columns: { image: true },
    },
  };

  const data = await db.query.doctors.findMany(queryOptions);

  // If no doctors found, return early
  if (data.length === 0) {
    return { data: [], pagination: calculatePaginationMetadata(page, limit, totalCount) };
  }

  // Type-safe enriched data
  let enrichedData: any[] = data;
  const doctorIds = data.map((d) => d.id);

  // Conditionally fetch stats
  if (includeStats) {
    const reviewStats = await db
      .select({
        doctorId: reviews.doctorId,
        averageScore: sql<number>`COALESCE(AVG(${reviews.score}), 0)`,
        totalReviews: count(reviews.id),
      })
      .from(reviews)
      .where(sql`${reviews.doctorId} IN (${sql.join(doctorIds, sql.raw(","))})`)
      .groupBy(reviews.doctorId);

    const reviewStatsMap = new Map(reviewStats.map((r) => [r.doctorId, r]));

    enrichedData = enrichedData.map((doctor) => ({
      ...doctor,
      stats: {
        averageScore: reviewStatsMap.get(doctor.id)?.averageScore || 0,
        totalReviews: reviewStatsMap.get(doctor.id)?.totalReviews || 0,
      },
    }));
  }

  // Conditionally fetch conditions
  if (includeConditions) {
    const doctorConditionsData = await db
      .select({
        doctorId: doctorConditions.doctorId,
        conditionId: doctorConditions.conditionId,
        conditionName: conditionsTable.name,
      })
      .from(doctorConditions)
      .leftJoin(conditionsTable, eq(doctorConditions.conditionId, conditionsTable.id))
      .where(sql`${doctorConditions.doctorId} IN (${sql.join(doctorIds, sql.raw(","))})`)
      .orderBy(doctorConditions.doctorId, conditionsTable.name);

    const conditionsMap = new Map<number, string[]>();
    doctorConditionsData.forEach((dc) => {
      if (!conditionsMap.has(dc.doctorId)) {
        conditionsMap.set(dc.doctorId, []);
      }
      if (dc.conditionName) {
        conditionsMap.get(dc.doctorId)!.push(dc.conditionName);
      }
    });

    enrichedData = enrichedData.map((doctor) => ({
      ...doctor,
      conditions: conditionsMap.get(doctor.id) || [],
    }));
  }

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

export async function createDoctorService(doctorId: number, serviceId: number, amount: number) {
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

export async function createDoctorPhone(
  doctorId: number,
  data: { areaCode: number; number: number }
) {
  const [phone] = await db
    .insert(phones)
    .values({ ...data, doctorId, personId: null })
    .returning();
  return phone;
}

export async function editDoctorPhone(
  phoneId: number,
  data: { areaCode?: number; number?: number }
) {
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

export async function createDoctorCondition(doctorId: number, conditionId: number, type: string) {
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
    where: and(eq(doctorLanguages.doctorId, doctorId), eq(doctorLanguages.languageId, languageId)),
  });
}

export async function createDoctorLanguage(doctorId: number, languageId: number, type: string) {
  const [row] = await db
    .insert(doctorLanguages)
    .values({ doctorId, languageId, type: type as any })
    .returning();
  return row;
}

export async function deleteDoctorLanguage(doctorId: number, languageId: number) {
  await db
    .delete(doctorLanguages)
    .where(and(eq(doctorLanguages.doctorId, doctorId), eq(doctorLanguages.languageId, languageId)));
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
        columns: {
          firstName: true,
          firstLastName: true,
        },
      },
    },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

// ============================================================================
// IDENTITIES (M2M)
// ============================================================================

export async function findDoctorIdentities(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(doctorIdentities.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(doctorIdentities)
    .where(whereClause);

  const data = await db.query.doctorIdentities.findMany({
    where: whereClause,
    limit,
    offset,
    with: { identity: true },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorIdentity(doctorId: number, identityId: number) {
  return db.query.doctorIdentities.findFirst({
    where: and(
      eq(doctorIdentities.doctorId, doctorId),
      eq(doctorIdentities.identityId, identityId)
    ),
  });
}

export async function createDoctorIdentity(doctorId: number, identityId: number) {
  const [row] = await db.insert(doctorIdentities).values({ doctorId, identityId }).returning();
  return row;
}

export async function deleteDoctorIdentity(doctorId: number, identityId: number) {
  await db
    .delete(doctorIdentities)
    .where(
      and(eq(doctorIdentities.doctorId, doctorId), eq(doctorIdentities.identityId, identityId))
    );
}

// ============================================================================
// PERSONALITY TRAITS (M2M)
// ============================================================================

export async function findDoctorPersonalityTraits(doctorId: number, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;
  const whereClause = eq(doctorPersonalityTraits.doctorId, doctorId);

  const [{ count: totalCount }] = await db
    .select({ count: count() })
    .from(doctorPersonalityTraits)
    .where(whereClause);

  const data = await db.query.doctorPersonalityTraits.findMany({
    where: whereClause,
    limit,
    offset,
    with: { personalityTrait: true },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findDoctorPersonalityTrait(doctorId: number, personalityTraitId: number) {
  return db.query.doctorPersonalityTraits.findFirst({
    where: and(
      eq(doctorPersonalityTraits.doctorId, doctorId),
      eq(doctorPersonalityTraits.personalityTraitId, personalityTraitId)
    ),
  });
}

export async function createDoctorPersonalityTrait(doctorId: number, personalityTraitId: number) {
  const [row] = await db
    .insert(doctorPersonalityTraits)
    .values({ doctorId, personalityTraitId })
    .returning();
  return row;
}

export async function deleteDoctorPersonalityTrait(doctorId: number, personalityTraitId: number) {
  await db
    .delete(doctorPersonalityTraits)
    .where(
      and(
        eq(doctorPersonalityTraits.doctorId, doctorId),
        eq(doctorPersonalityTraits.personalityTraitId, personalityTraitId)
      )
    );
}

// ============================================================================
// DETAIL VIEW
// ============================================================================

export async function findDoctorDetailById(id: number) {
  return db.query.doctors.findFirst({
    where: and(eq(doctors.id, id), eq(doctors.isActive, true)),
    columns: {
      id: true,
      firstName: true,
      middleName: true,
      firstLastName: true,
      secondLastName: true,
      consultationType: true,
      biography: true,
      firstSessionExpectation: true,
      biggestStrengths: true,
      practiceStartYear: true,
      placeId: true, // needed for place relation
    },
    with: {
      user: {
        columns: { image: true },
      },
      place: true,
      educations: {
        with: {
          institution: {
            with: {
              place: true,
            },
          },
        },
      },
      ageGroups: true,
      schedules: true,
      doctorServices: { with: { service: true } },
      doctorConditions: { with: { condition: true } },
      doctorLanguages: { with: { language: true } },
      doctorIdentities: { with: { identity: true } },
      doctorPersonalityTraits: { with: { personalityTrait: true } },
    },
  });
}
