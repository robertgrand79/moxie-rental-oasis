/**
 * Centralized API Response Types
 * Provides type-safe wrappers for Supabase query responses
 */

import { PostgrestError } from '@supabase/supabase-js';

// ============================================
// Generic Response Types
// ============================================

/**
 * Standard Supabase query response wrapper
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

/**
 * Supabase query response for array results
 */
export interface SupabaseArrayResponse<T> {
  data: T[] | null;
  error: PostgrestError | null;
}

/**
 * Supabase query response with count
 */
export interface SupabaseCountResponse<T> {
  data: T[] | null;
  error: PostgrestError | null;
  count: number | null;
}

/**
 * Supabase single row response
 */
export interface SupabaseSingleResponse<T> {
  data: T | null;
  error: PostgrestError | null;
}

/**
 * Supabase mutation response (insert/update/delete)
 */
export interface SupabaseMutationResponse<T = void> {
  data: T | null;
  error: PostgrestError | null;
}

// ============================================
// API Result Types (for function returns)
// ============================================

/**
 * Generic API result type for async operations
 */
export type ApiResult<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Paginated API result
 */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API operation status
 */
export interface OperationStatus {
  success: boolean;
  message?: string;
  code?: string;
}

// ============================================
// Edge Function Response Types
// ============================================

/**
 * Standard edge function success response
 */
export interface EdgeFunctionSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard edge function error response
 */
export interface EdgeFunctionErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Combined edge function response type
 */
export type EdgeFunctionResponse<T = unknown> = 
  | EdgeFunctionSuccessResponse<T>
  | EdgeFunctionErrorResponse;

// ============================================
// Query Builder Types
// ============================================

/**
 * Sort direction for queries
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Query filter operator
 */
export type FilterOperator = 
  | 'eq' 
  | 'neq' 
  | 'gt' 
  | 'gte' 
  | 'lt' 
  | 'lte' 
  | 'like' 
  | 'ilike' 
  | 'in' 
  | 'is' 
  | 'contains';

/**
 * Query filter configuration
 */
export interface QueryFilter {
  column: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Query sort configuration
 */
export interface QuerySort {
  column: string;
  direction: SortDirection;
}

/**
 * Query pagination configuration
 */
export interface QueryPagination {
  page: number;
  pageSize: number;
}

/**
 * Complete query options
 */
export interface QueryOptions {
  filters?: QueryFilter[];
  sort?: QuerySort;
  pagination?: QueryPagination;
  select?: string;
}

// ============================================
// Type Guards
// ============================================

/**
 * Check if a Supabase response has an error
 */
export function hasSupabaseError<T>(
  response: SupabaseResponse<T>
): response is { data: null; error: PostgrestError } {
  return response.error !== null;
}

/**
 * Check if a Supabase response has data
 */
export function hasSupabaseData<T>(
  response: SupabaseResponse<T>
): response is { data: T; error: null } {
  return response.data !== null && response.error === null;
}

/**
 * Check if an API result is successful
 */
export function isApiSuccess<T, E>(
  result: ApiResult<T, E>
): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Check if an edge function response is successful
 */
export function isEdgeFunctionSuccess<T>(
  response: EdgeFunctionResponse<T>
): response is EdgeFunctionSuccessResponse<T> {
  return response.success === true;
}

// ============================================
// Utility Types
// ============================================

/**
 * Extract the data type from a Supabase response
 */
export type ExtractSupabaseData<T> = T extends SupabaseResponse<infer U> ? U : never;

/**
 * Make all properties in T optional except for K
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Make specific properties in T required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
