/**
 * Auth-related type definitions
 */

import { AuthError } from '@supabase/supabase-js';

/**
 * Result type for auth operations
 */
export interface AuthResult {
  error: AuthError | { message: string } | null;
}

/**
 * Lockout check result from RPC
 */
export interface LockoutCheckResult {
  is_locked?: boolean;
  locked_until?: string;
  message?: string;
}

/**
 * Failed login tracking result from RPC
 */
export interface FailedLoginTrackResult {
  is_locked?: boolean;
  remaining_attempts?: number;
  message?: string;
}

/**
 * User profile shape
 */
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  updated_at: string;
}

/**
 * Error with optional code property
 */
export interface AuthErrorWithCode extends Error {
  code?: string;
}
