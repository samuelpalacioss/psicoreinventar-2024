export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Generic query options for DAL functions with dynamic column selection
 * @template T - Column selection map (e.g., { id: true, name: true, email: false })
 */
export interface QueryOptions<T = any> {
  columns?: T;
}
