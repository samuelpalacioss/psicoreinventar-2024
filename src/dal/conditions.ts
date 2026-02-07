import db from "@/src/db";
import { conditions } from "@/src/db/schema";
import { and, count, ilike, eq } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams } from "./types";

export interface ConditionFilters {
  search?: string;
}

export async function findAllConditions(filters: ConditionFilters, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;

  const conds = [];
  if (filters.search) {
    conds.push(ilike(conditions.name, `%${filters.search}%`));
  }

  const whereClause = conds.length > 0 ? and(...conds) : undefined;

  const countQuery = db.select({ count: count() }).from(conditions);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const dataQuery = db.select().from(conditions).limit(limit).offset(offset);
  if (whereClause) dataQuery.where(whereClause);
  const data = await dataQuery;

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findConditionById(id: number) {
  return db.query.conditions.findFirst({ where: eq(conditions.id, id) });
}

export async function findConditionByName(name: string) {
  return db.query.conditions.findFirst({ where: ilike(conditions.name, name) });
}

export async function createCondition(data: typeof conditions.$inferInsert) {
  const [condition] = await db.insert(conditions).values(data).returning();
  return condition;
}

export async function editCondition(id: number, data: Partial<typeof conditions.$inferInsert>) {
  const [condition] = await db
    .update(conditions)
    .set(data)
    .where(eq(conditions.id, id))
    .returning();
  return condition;
}

export async function deleteCondition(id: number) {
  await db.delete(conditions).where(eq(conditions.id, id));
}
