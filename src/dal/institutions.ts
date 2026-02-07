import db from "@/src/db";
import { institutions } from "@/src/db/schema";
import { and, count, ilike, eq } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams } from "./types";

export interface InstitutionFilters {
  search?: string;
  type?: string;
  placeId?: number;
}

export async function findAllInstitutions(
  filters: InstitutionFilters,
  pagination: PaginationParams
) {
  const { page, limit, offset } = pagination;

  const conds = [];
  if (filters.search) {
    conds.push(ilike(institutions.name, `%${filters.search}%`));
  }
  if (filters.type) {
    conds.push(eq(institutions.type, filters.type as any));
  }
  if (filters.placeId) {
    conds.push(eq(institutions.placeId, filters.placeId));
  }

  const whereClause = conds.length > 0 ? and(...conds) : undefined;

  const countQuery = db.select({ count: count() }).from(institutions);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const data = await db.query.institutions.findMany({
    where: whereClause,
    limit,
    offset,
    with: { place: true },
  });

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findInstitutionById(id: number) {
  return db.query.institutions.findFirst({
    where: eq(institutions.id, id),
    with: { place: true },
  });
}

export async function findInstitutionByName(name: string) {
  return db.query.institutions.findFirst({ where: ilike(institutions.name, name) });
}

export async function createInstitution(data: typeof institutions.$inferInsert) {
  const [institution] = await db.insert(institutions).values(data).returning();
  return institution;
}

export async function editInstitution(
  id: number,
  data: Partial<typeof institutions.$inferInsert>
) {
  const [institution] = await db
    .update(institutions)
    .set(data)
    .where(eq(institutions.id, id))
    .returning();
  return institution;
}

export async function deleteInstitution(id: number) {
  await db.delete(institutions).where(eq(institutions.id, id));
}
