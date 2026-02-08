import db from "@/src/db";
import { treatmentMethods } from "@/src/db/schema";
import { and, count, ilike, or, eq } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams, QueryOptions } from "./types";

export interface TreatmentMethodFilters {
  search?: string;
}

export interface TreatmentMethodQueryOptions<T = any> extends QueryOptions<T> {}

export async function findAllTreatmentMethods<
  const T extends { [K in keyof typeof treatmentMethods.$inferSelect]?: boolean }
>(
  filters: TreatmentMethodFilters,
  pagination: PaginationParams,
  options: TreatmentMethodQueryOptions<T> = {}
) {
  const { page, limit, offset } = pagination;
  const { columns } = options;

  const conds = [];
  if (filters.search) {
    conds.push(
      or(
        ilike(treatmentMethods.name, `%${filters.search}%`),
        ilike(treatmentMethods.description, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conds.length > 0 ? and(...conds) : undefined;

  const countQuery = db.select({ count: count() }).from(treatmentMethods);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const queryOptions: any = {
    where: whereClause,
    limit,
    offset,
  };

  if (columns) {
    queryOptions.columns = columns;
  }

  const data = await db.query.treatmentMethods.findMany(queryOptions);

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findTreatmentMethodById(id: number) {
  return db.query.treatmentMethods.findFirst({ where: eq(treatmentMethods.id, id) });
}

export async function findTreatmentMethodByName(name: string) {
  return db.query.treatmentMethods.findFirst({ where: ilike(treatmentMethods.name, name) });
}

export async function createTreatmentMethod(data: typeof treatmentMethods.$inferInsert) {
  const [method] = await db.insert(treatmentMethods).values(data).returning();
  return method;
}

export async function editTreatmentMethod(
  id: number,
  data: Partial<typeof treatmentMethods.$inferInsert>
) {
  const [method] = await db
    .update(treatmentMethods)
    .set(data)
    .where(eq(treatmentMethods.id, id))
    .returning();
  return method;
}

export async function deleteTreatmentMethod(id: number) {
  await db.delete(treatmentMethods).where(eq(treatmentMethods.id, id));
}
