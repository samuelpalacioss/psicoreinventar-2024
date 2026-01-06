import { SQL, and, count } from "drizzle-orm";
import db from "@/src/db";

/**
 * Pagination constants
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

/**
 * Pagination metadata structure
 */
export interface PaginationMetadata {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Extract and validate pagination parameters from URL search params
 *
 * @param searchParams - URL search params
 * @returns Validated pagination parameters
 */
export function getPaginationParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  offset: number;
} {
  // Parse page (default to 1, minimum 1)
  const pageParam = searchParams.get("page");
  const page = Math.max(1, pageParam ? parseInt(pageParam, 10) : DEFAULT_PAGE);

  // Parse limit (default to 20, max 50)
  const limitParam = searchParams.get("limit");
  let limit = limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT;
  limit = Math.min(MAX_LIMIT, Math.max(1, limit));

  // Calculate offset
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Calculate pagination metadata
 *
 * @param page - Current page number
 * @param limit - Items per page
 * @param totalCount - Total number of items
 * @returns Pagination metadata object
 */
export function calculatePaginationMetadata(
  page: number,
  limit: number,
  totalCount: number
): PaginationMetadata {
  const totalPages = Math.ceil(totalCount / limit);

  return {
    page,
    limit,
    totalCount,
    totalPages,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };
}

/**
 * Execute a paginated query with total count
 *
 * @param table - The Drizzle table to query
 * @param options - Query options
 * @returns Object containing data and pagination metadata
 */
export async function paginateQuery(
  table: any,
  options: {
    where?: SQL;
    orderBy?: SQL;
    page: number;
    limit: number;
  }
): Promise<{
  data: any[];
  pagination: PaginationMetadata;
}> {
  const { where, orderBy, page, limit } = options;
  const offset = (page - 1) * limit;

  // Build the WHERE clause
  const whereConditions: SQL[] = [];
  if (where) {
    whereConditions.push(where);
  }

  const finalWhere = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  // Get total count using Drizzle's count function
  const countQuery = db.select({ count: count() }).from(table);

  if (finalWhere) {
    countQuery.where(finalWhere);
  }

  const [{ count: totalCount }] = await countQuery;

  // Get paginated data
  const dataQuery = db.select().from(table).limit(limit).offset(offset);

  if (finalWhere) {
    dataQuery.where(finalWhere);
  }

  if (orderBy) {
    dataQuery.orderBy(orderBy);
  }

  const data = await dataQuery;

  // Calculate pagination metadata
  const pagination = calculatePaginationMetadata(page, limit, totalCount);

  return {
    data,
    pagination,
  };
}

/**
 * Create a standardized paginated response
 *
 * @param data - The data array
 * @param pagination - Pagination metadata
 * @returns Standardized paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMetadata
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
  };
}
