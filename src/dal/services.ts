import db from "@/src/db";
import { services } from "@/src/db/schema";
import { and, count, ilike, or, eq } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams } from "./types";

export interface ServiceFilters {
  search?: string;
}

export async function findAllServices(filters: ServiceFilters, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;

  const conds = [];
  if (filters.search) {
    conds.push(
      or(
        ilike(services.name, `%${filters.search}%`),
        ilike(services.description, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conds.length > 0 ? and(...conds) : undefined;

  const countQuery = db.select({ count: count() }).from(services);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const dataQuery = db.select().from(services).limit(limit).offset(offset);
  if (whereClause) dataQuery.where(whereClause);
  const data = await dataQuery;

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findServiceById(id: number) {
  return db.query.services.findFirst({ where: eq(services.id, id) });
}

export async function findServiceByName(name: string) {
  return db.query.services.findFirst({ where: ilike(services.name, name) });
}

export async function createService(data: typeof services.$inferInsert) {
  const [service] = await db.insert(services).values(data).returning();
  return service;
}

export async function editService(id: number, data: Partial<typeof services.$inferInsert>) {
  const [service] = await db.update(services).set(data).where(eq(services.id, id)).returning();
  return service;
}

export async function deleteService(id: number) {
  await db.delete(services).where(eq(services.id, id));
}
