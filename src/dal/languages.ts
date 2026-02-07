import db from "@/src/db";
import { languages } from "@/src/db/schema";
import { and, count, ilike, eq } from "drizzle-orm";
import { calculatePaginationMetadata } from "@/utils/api/pagination/paginate";
import type { PaginationParams } from "./types";

export interface LanguageFilters {
  search?: string;
}

export async function findAllLanguages(filters: LanguageFilters, pagination: PaginationParams) {
  const { page, limit, offset } = pagination;

  const conds = [];
  if (filters.search) {
    conds.push(ilike(languages.name, `%${filters.search}%`));
  }

  const whereClause = conds.length > 0 ? and(...conds) : undefined;

  const countQuery = db.select({ count: count() }).from(languages);
  if (whereClause) countQuery.where(whereClause);
  const [{ count: totalCount }] = await countQuery;

  const dataQuery = db.select().from(languages).limit(limit).offset(offset);
  if (whereClause) dataQuery.where(whereClause);
  const data = await dataQuery;

  return { data, pagination: calculatePaginationMetadata(page, limit, totalCount) };
}

export async function findLanguageById(id: number) {
  return db.query.languages.findFirst({ where: eq(languages.id, id) });
}

export async function findLanguageByName(name: string) {
  return db.query.languages.findFirst({ where: ilike(languages.name, name) });
}

export async function createLanguage(data: typeof languages.$inferInsert) {
  const [language] = await db.insert(languages).values(data).returning();
  return language;
}

export async function editLanguage(id: number, data: Partial<typeof languages.$inferInsert>) {
  const [language] = await db
    .update(languages)
    .set(data)
    .where(eq(languages.id, id))
    .returning();
  return language;
}

export async function deleteLanguage(id: number) {
  await db.delete(languages).where(eq(languages.id, id));
}
