import db from "@/src/db";
import { treatmentMethods } from "@/src/db/schema";
import { and, count, ilike, or, eq } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams } from "./types";

export interface TreatmentMethodFilters {
  search?: string;
}

export async function findAllTreatmentMethods(
  filters: TreatmentMethodFilters,
  pagination: PaginationParams
) {
  const { page, limit, offset } = pagination;

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

  const dataQuery = db.select().from(treatmentMethods).limit(limit).offset(offset);
  if (whereClause) dataQuery.where(whereClause);
  const data = await dataQuery;

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
