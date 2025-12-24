/**
 * Query Helper Utilities
 * Provides typed wrappers for common Supabase operations
 */

import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { 
  SupabaseResponse, 
  SupabaseArrayResponse, 
  ApiResult,
  QueryOptions,
  QueryPagination 
} from '@/types/api/responses';

// ============================================
// Query Execution Helpers
// ============================================

/**
 * Execute a Supabase query and return a typed result
 */
export async function executeQuery<T>(
  queryFn: () => Promise<SupabaseResponse<T>>
): Promise<ApiResult<T, PostgrestError>> {
  const { data, error } = await queryFn();
  
  if (error) {
    return { success: false, error };
  }
  
  if (data === null) {
    return { 
      success: false, 
      error: { 
        message: 'No data returned', 
        details: null, 
        hint: null, 
        code: 'PGRST116' 
      } as PostgrestError 
    };
  }
  
  return { success: true, data };
}

/**
 * Execute a Supabase array query and return a typed result
 */
export async function executeArrayQuery<T>(
  queryFn: () => Promise<SupabaseArrayResponse<T>>
): Promise<ApiResult<T[], PostgrestError>> {
  const { data, error } = await queryFn();
  
  if (error) {
    return { success: false, error };
  }
  
  return { success: true, data: data ?? [] };
}

// ============================================
// Pagination Helpers
// ============================================

/**
 * Calculate pagination range for Supabase queries
 */
export function getPaginationRange(pagination: QueryPagination): { from: number; to: number } {
  const from = (pagination.page - 1) * pagination.pageSize;
  const to = from + pagination.pageSize - 1;
  return { from, to };
}

/**
 * Calculate total pages from count
 */
export function getTotalPages(totalCount: number, pageSize: number): number {
  return Math.ceil(totalCount / pageSize);
}

/**
 * Check if there are more pages
 */
export function hasMorePages(
  currentPage: number, 
  totalCount: number, 
  pageSize: number
): boolean {
  return currentPage < getTotalPages(totalCount, pageSize);
}

// ============================================
// Error Handling Helpers
// ============================================

/**
 * Extract user-friendly message from Supabase error
 */
export function getErrorMessage(error: PostgrestError | null): string {
  if (!error) return 'An unknown error occurred';
  
  // Map common error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    'PGRST116': 'The requested item was not found',
    'PGRST204': 'No content returned',
    '23505': 'This item already exists',
    '23503': 'Cannot delete: this item is referenced by other records',
    '42501': 'You do not have permission to perform this action',
    '42P01': 'The requested resource does not exist',
    'PGRST301': 'Request timeout - please try again',
  };
  
  return errorMessages[error.code] || error.message || 'An error occurred';
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: PostgrestError): boolean {
  return error.code === 'PGRST116';
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: PostgrestError): boolean {
  return error.code === '42501' || error.code === '42000';
}

/**
 * Check if error is a duplicate error
 */
export function isDuplicateError(error: PostgrestError): boolean {
  return error.code === '23505';
}

/**
 * Check if error is a foreign key violation
 */
export function isForeignKeyError(error: PostgrestError): boolean {
  return error.code === '23503';
}

// ============================================
// Query Key Factories
// ============================================

/**
 * Create query keys for React Query
 */
export const queryKeys = {
  // Base keys
  all: ['supabase'] as const,
  
  // Entity-specific keys
  profiles: {
    all: () => [...queryKeys.all, 'profiles'] as const,
    detail: (id: string) => [...queryKeys.profiles.all(), id] as const,
    current: () => [...queryKeys.profiles.all(), 'current'] as const,
  },
  
  organizations: {
    all: () => [...queryKeys.all, 'organizations'] as const,
    detail: (id: string) => [...queryKeys.organizations.all(), id] as const,
    members: (orgId: string) => [...queryKeys.organizations.detail(orgId), 'members'] as const,
    settings: (orgId: string) => [...queryKeys.organizations.detail(orgId), 'settings'] as const,
  },
  
  properties: {
    all: () => [...queryKeys.all, 'properties'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.properties.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.properties.all(), id] as const,
    availability: (id: string) => [...queryKeys.properties.detail(id), 'availability'] as const,
    pricing: (id: string) => [...queryKeys.properties.detail(id), 'pricing'] as const,
  },
  
  reservations: {
    all: () => [...queryKeys.all, 'reservations'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.reservations.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.reservations.all(), id] as const,
    upcoming: () => [...queryKeys.reservations.all(), 'upcoming'] as const,
  },
  
  blogPosts: {
    all: () => [...queryKeys.all, 'blog_posts'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.blogPosts.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.blogPosts.all(), id] as const,
    bySlug: (slug: string) => [...queryKeys.blogPosts.all(), 'slug', slug] as const,
    published: () => [...queryKeys.blogPosts.all(), 'published'] as const,
  },
  
  workOrders: {
    all: () => [...queryKeys.all, 'work_orders'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.workOrders.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.workOrders.all(), id] as const,
    pending: () => [...queryKeys.workOrders.all(), 'pending'] as const,
  },
  
  contractors: {
    all: () => [...queryKeys.all, 'contractors'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.contractors.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.contractors.all(), id] as const,
  },
  
  newsletter: {
    campaigns: () => [...queryKeys.all, 'newsletter', 'campaigns'] as const,
    subscribers: () => [...queryKeys.all, 'newsletter', 'subscribers'] as const,
    analytics: (campaignId: string) => [...queryKeys.all, 'newsletter', 'analytics', campaignId] as const,
  },
  
  assistant: {
    settings: (orgId: string) => [...queryKeys.all, 'assistant', 'settings', orgId] as const,
    conversations: (orgId: string) => [...queryKeys.all, 'assistant', 'conversations', orgId] as const,
    escalations: (orgId: string) => [...queryKeys.all, 'assistant', 'escalations', orgId] as const,
  },
  
  analytics: {
    events: (orgId: string) => [...queryKeys.all, 'analytics', 'events', orgId] as const,
    dashboard: (orgId: string) => [...queryKeys.all, 'analytics', 'dashboard', orgId] as const,
  },
  
  places: {
    all: () => [...queryKeys.all, 'places'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.places.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.places.all(), id] as const,
  },
  
  events: {
    all: () => [...queryKeys.all, 'events'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.events.all(), 'list', filters] as const,
    detail: (id: string) => [...queryKeys.events.all(), id] as const,
    upcoming: () => [...queryKeys.events.all(), 'upcoming'] as const,
  },
} as const;

// ============================================
// Type-safe Table Names
// ============================================

export type TableName = 
  | 'profiles'
  | 'organizations'
  | 'organization_members'
  | 'properties'
  | 'reservations'
  | 'blog_posts'
  | 'site_settings'
  | 'work_orders'
  | 'contractors'
  | 'guests'
  | 'availability_blocks'
  | 'dynamic_pricing'
  | 'assistant_settings'
  | 'assistant_conversations'
  | 'assistant_messages'
  | 'assistant_escalations'
  | 'guest_communications'
  | 'guest_inbox_threads'
  | 'guest_profiles'
  | 'newsletter_campaigns'
  | 'newsletter_subscribers'
  | 'community_updates'
  | 'external_calendars'
  | 'property_fees'
  | 'seam_devices'
  | 'seam_access_codes'
  | 'admin_notifications'
  | 'analytics_events'
  | 'error_logs'
  | 'help_articles'
  | 'help_categories'
  | 'places'
  | 'eugene_events'
  | 'lifestyle_gallery';
