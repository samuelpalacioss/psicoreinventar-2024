import db from "@/src/db";
import { reviews } from "@/src/db/schema";
import { and, count, eq, gte, lte } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams, QueryOptions } from "./types";

// ============================================================================
// FILTERS
// ============================================================================

export interface ReviewFilters {
  doctorId?: number;
  personId?: number;
  minScore?: number;
  maxScore?: number;
}

export interface ReviewQueryOptions<T = any> extends QueryOptions<T> {
  includeDoctor?: boolean;
  includePatient?: boolean;
}

// ============================================================================
// CORE
// ============================================================================

export async function findAllReviews<
  const T extends { [K in keyof typeof reviews.$inferSelect]?: boolean }
>(
  filters: ReviewFilters,
  pagination: PaginationParams,
  options: ReviewQueryOptions<T> = {}
) {
  const { page, limit, offset } = pagination;
  const { columns, includeDoctor = true, includePatient = true } = options;

  const conditions = [];

  if (filters.doctorId) {
    conditions.push(eq(reviews.doctorId, filters.doctorId));
  }
  if (filters.personId) {
    conditions.push(eq(reviews.personId, filters.personId));
  }
  if (filters.minScore !== undefined) {
    conditions.push(gte(reviews.score, filters.minScore));
  }
  if (filters.maxScore !== undefined) {
    conditions.push(lte(reviews.score, filters.maxScore));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countQuery = db.select({ count: count() }).from(reviews);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const queryOptions: any = {
    where: whereClause,
    limit,
    offset,
    orderBy: (r: any, { desc }: any) => [desc(r.createdAt)],
  };

  if (columns) {
    queryOptions.columns = columns;
  }

  const withOptions: any = {};
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

  if (Object.keys(withOptions).length > 0) {
    queryOptions.with = withOptions;
  }

  const data = await db.query.reviews.findMany(queryOptions);

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findReviewById(id: number) {
  return db.query.reviews.findFirst({
    where: eq(reviews.id, id),
    with: {
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
      person: {
        columns: {
          id: true,
          firstName: true,
          middleName: true,
          firstLastName: true,
          secondLastName: true,
        },
      },
      appointment: { columns: { id: true, startDateTime: true, status: true } },
    },
  });
}

export async function editReview(
  id: number,
  data: Partial<typeof reviews.$inferInsert>
) {
  const [review] = await db
    .update(reviews)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(reviews.id, id))
    .returning();
  return review;
}

export async function deleteReview(id: number) {
  await db.delete(reviews).where(eq(reviews.id, id));
}
