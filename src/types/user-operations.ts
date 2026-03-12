/**
 * User Operations Types
 * Types for user management operations in useUserOperations.ts
 */

import type { Database } from '@/integrations/supabase/types';

/**
 * Profile table row type from database
 */
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/**
 * Profile update type from database
 */
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * User profile update data - only updatable fields
 */
export interface UserProfileUpdate {
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  company_name?: string | null;
  status?: string;
}

/**
 * User invitation data
 */
export interface UserInvitation {
  email: string;
  role: string;
  full_name?: string;
  team_role?: string;
}

/**
 * Valid user roles - using string to allow flexibility with custom roles
 */
export type UserRole = string;

/**
 * Edge function error response
 */
export interface EdgeFunctionError {
  message?: string;
  code?: string;
}

/**
 * Type guard for edge function errors
 */
export function isEdgeFunctionError(error: unknown): error is EdgeFunctionError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('message' in error || 'code' in error)
  );
}
