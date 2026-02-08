import db from "@/src/db";
import { progresses } from "@/src/db/schema";
import { and, count, eq } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams, QueryOptions } from "./types";

// ============================================================================
// FILTERS
// ============================================================================

export interface ProgressFilters {
  personId?: number;
  doctorId?: number;
  appointmentId?: number;
  conditionId?: number;
}

export interface ProgressQueryOptions<T = any> extends QueryOptions<T> {
  includePatient?: boolean;
  includeDoctor?: boolean;
  includeAppointment?: boolean;
  includeCondition?: boolean;
}

// ============================================================================
// CORE
// ============================================================================

export async function findAllProgresses<
  const T extends { [K in keyof typeof progresses.$inferSelect]?: boolean }
>(
  filters: ProgressFilters,
  pagination: PaginationParams,
  options: ProgressQueryOptions<T> = {}
) {
  const { page, limit, offset } = pagination;
  const {
    columns,
    includePatient = true,
    includeDoctor = true,
    includeAppointment = true,
    includeCondition = true,
  } = options;

  const conditions = [];

  if (filters.personId) {
    conditions.push(eq(progresses.personId, filters.personId));
  }
  if (filters.doctorId) {
    conditions.push(eq(progresses.doctorId, filters.doctorId));
  }
  if (filters.appointmentId) {
    conditions.push(eq(progresses.appointmentId, filters.appointmentId));
  }
  if (filters.conditionId) {
    conditions.push(eq(progresses.conditionId, filters.conditionId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countQuery = db.select({ count: count() }).from(progresses);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const queryOptions: any = {
    where: whereClause,
    limit,
    offset,
    orderBy: (p: any, { desc }: any) => [desc(p.createdAt)],
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
  if (includeAppointment) {
    withOptions.appointment = { columns: { id: true, startDateTime: true, status: true } };
  }
  if (includeCondition) {
    withOptions.condition = { columns: { id: true, name: true } };
  }

  if (Object.keys(withOptions).length > 0) {
    queryOptions.with = withOptions;
  }

  const data = await db.query.progresses.findMany(queryOptions);

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findProgressById(id: number) {
  return db.query.progresses.findFirst({
    where: eq(progresses.id, id),
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
      appointment: { columns: { id: true, startDateTime: true, status: true } },
      condition: { columns: { id: true, name: true } },
    },
  });
}

export async function findProgressByIdWithDoctor(id: number) {
  return db.query.progresses.findFirst({
    where: eq(progresses.id, id),
    with: { doctor: true },
  });
}

export async function createProgress(data: typeof progresses.$inferInsert) {
  const [progress] = await db.insert(progresses).values(data).returning();
  return progress;
}

export async function editProgress(
  id: number,
  data: Partial<typeof progresses.$inferInsert>
) {
  const [progress] = await db
    .update(progresses)
    .set(data)
    .where(eq(progresses.id, id))
    .returning();
  return progress;
}

export async function deleteProgress(id: number) {
  await db.delete(progresses).where(eq(progresses.id, id));
}
