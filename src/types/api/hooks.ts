/**
 * Hook-specific API types
 * Types for React Query and custom hooks
 */

import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { PostgrestError } from '@supabase/supabase-js';

// ============================================
// Query Hook Types
// ============================================

/**
 * Base query hook options (extends React Query options)
 */
export type QueryHookOptions<TData, TError = PostgrestError> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
>;

/**
 * Mutation hook options
 */
export type MutationHookOptions<TData, TVariables, TError = PostgrestError> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationFn'
>;

// ============================================
// Query State Types
// ============================================

/**
 * Standard query state for data fetching
 */
export interface QueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Paginated query state
 */
export interface PaginatedQueryState<T> extends QueryState<T[]> {
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
}

/**
 * Infinite query state
 */
export interface InfiniteQueryState<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

// ============================================
// Mutation State Types
// ============================================

/**
 * Standard mutation state
 */
export interface MutationState<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data: TData | undefined;
  reset: () => void;
}

// ============================================
// Filter & Sort Types for Hooks
// ============================================

/**
 * Common filter state for list hooks
 */
export interface ListFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Blog post specific filters
 */
export interface BlogPostFilters extends ListFilters {
  contentType?: string;
  category?: string;
  tags?: string[];
  isFeatured?: boolean;
}

/**
 * Reservation specific filters
 */
export interface ReservationFilters extends ListFilters {
  propertyId?: string;
  guestEmail?: string;
  source?: string;
}

/**
 * Work order specific filters
 */
export interface WorkOrderFilters extends ListFilters {
  propertyId?: string;
  priority?: string;
  assignedTo?: string;
  category?: string;
}

/**
 * Newsletter subscriber filters
 */
export interface SubscriberFilters extends ListFilters {
  isActive?: boolean;
  source?: string;
  tags?: string[];
}

// ============================================
// Hook Return Types
// ============================================

/**
 * Standard CRUD hook return type
 */
export interface CrudHookReturn<T, TCreate, TUpdate> {
  // Query
  items: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  
  // Mutations
  create: (data: TCreate) => Promise<T>;
  update: (id: string, data: TUpdate) => Promise<T>;
  remove: (id: string) => Promise<void>;
  
  // Mutation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

/**
 * Single item hook return type
 */
export interface SingleItemHookReturn<T, TUpdate> {
  item: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  update: (data: TUpdate) => Promise<T>;
  isUpdating: boolean;
}
