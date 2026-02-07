import db from "@/src/db";
import { places } from "@/src/db/schema";
import { and, count, eq, ilike } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams } from "./types";

export interface PlaceFilters {
  search?: string;
  type?: string;
}

export async function findAllPlaces(filters: PlaceFilters, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;

  const conditions = [];
  if (filters.search) {
    conditions.push(ilike(places.name, `%${filters.search}%`));
  }
  if (filters.type) {
    conditions.push(eq(places.type, filters.type));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countQuery = db.select({ count: count() }).from(places);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const dataQuery = db.select().from(places).limit(limit).offset(offset);
  if (whereClause) dataQuery.where(whereClause);
  const data = await dataQuery;

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findPlaceById(id: number) {
  return db.query.places.findFirst({ where: eq(places.id, id) });
}

export async function findPlaceByNameAndType(name: string, type: string) {
  return db.query.places.findFirst({
    where: and(ilike(places.name, name), eq(places.type, type)),
  });
}

export async function createPlace(data: typeof places.$inferInsert) {
  const [place] = await db.insert(places).values(data).returning();
  return place;
}

export async function editPlace(id: number, data: Partial<typeof places.$inferInsert>) {
  const [place] = await db.update(places).set(data).where(eq(places.id, id)).returning();
  return place;
}

export async function deletePlace(id: number) {
  await db.delete(places).where(eq(places.id, id));
}