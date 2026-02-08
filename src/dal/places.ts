import db from "@/src/db";
import { places } from "@/src/db/schema";
import { and, count, eq, ilike } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams, QueryOptions } from "./types";

export interface PlaceFilters {
  search?: string;
  type?: string;
}

export interface PlaceQueryOptions<T = any> extends QueryOptions<T> {}

export async function findAllPlaces<
  const T extends { [K in keyof typeof places.$inferSelect]?: boolean }
>(filters: PlaceFilters, pagination: PaginationParams, options: PlaceQueryOptions<T> = {}) {
  const { page, limit, offset } = pagination;
  const { columns } = options;

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

  // Use db.query with dynamic columns
  const queryOptions: any = {
    where: whereClause,
    limit,
    offset,
  };

  if (columns) {
    queryOptions.columns = columns;
  }

  const data = await db.query.places.findMany(queryOptions);

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