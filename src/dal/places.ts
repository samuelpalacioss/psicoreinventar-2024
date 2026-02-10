import db from "@/src/db";
import { places } from "@/src/db/schema";
import { and, count, eq, ilike, or, sql } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams, QueryOptions } from "./types";

export interface PlaceFilters {
  search?: string;      // Search in displayName or displayPlace
  type?: string;        // LocationIQ type
  city?: string;
  state?: string;
  country?: string;
}

export interface PlaceQueryOptions<T = any> extends QueryOptions<T> {}

export async function findAllPlaces<
  const T extends { [K in keyof typeof places.$inferSelect]?: boolean }
>(filters: PlaceFilters, pagination: PaginationParams, options: PlaceQueryOptions<T> = {}) {
  const { page, limit, offset } = pagination;
  const { columns } = options;

  const conditions = [];
  if (filters.search) {
    conditions.push(
      or(
        ilike(places.displayName, `%${filters.search}%`),
        ilike(places.displayPlace, `%${filters.search}%`)
      )
    );
  }
  if (filters.type) {
    conditions.push(eq(places.type, filters.type));
  }
  if (filters.city) {
    conditions.push(ilike(places.city, `%${filters.city}%`));
  }
  if (filters.state) {
    conditions.push(ilike(places.state, `%${filters.state}%`));
  }
  if (filters.country) {
    conditions.push(ilike(places.country, `%${filters.country}%`));
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
    where: and(ilike(places.displayPlace, name), eq(places.type, type)),
  });
}

export async function findPlaceByOsmId(osmId: string, osmType: string) {
  return db.query.places.findFirst({
    where: and(eq(places.osmId, osmId), eq(places.osmType, osmType)),
  });
}

export async function findPlaceByCoordinates(lat: string, lon: string, tolerance: number = 0.0001) {
  // Find place within tolerance of coordinates
  // Useful for preventing duplicate places at same location
  return db.query.places.findFirst({
    where: and(
      sql`ABS(${places.lat}::numeric - ${lat}::numeric) < ${tolerance}`,
      sql`ABS(${places.lon}::numeric - ${lon}::numeric) < ${tolerance}`
    ),
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