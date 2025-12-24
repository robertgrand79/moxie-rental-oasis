/**
 * Error handling utilities
 */

import { AppError, NetworkError, ApiError, AuthError, ValidationError } from './AppError';
import { debug } from '@/utils/debug';

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}

/**
 * Extract error code from unknown error
 */
export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Normalize any error to AppError
 */
export function normalizeError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return new NetworkError(error.message, { cause: error });
    }
    
    if (message.includes('unauthorized') || message.includes('unauthenticated') || message.includes('session')) {
      return new AuthError(error.message, { cause: error });
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return new ValidationError(error.message);
    }
    
    return new AppError(error.message, { cause: error });
  }

  return new AppError(getErrorMessage(error));
}

/**
 * Create an error handler with logging
 */
export function createErrorHandler(context: string) {
  return (error: unknown): AppError => {
    const appError = normalizeError(error);
    
    debug.error(`[${context}] ${appError.code}: ${appError.message}`, {
      context: appError.context,
      stack: appError.stack,
    });
    
    return appError;
  };
}

/**
 * Wrap async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context: string
): Promise<{ data: T; error: null } | { data: null; error: AppError }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const handleError = createErrorHandler(context);
    return { data: null, error: handleError(error) };
  }
}

/**
 * Parse Supabase error to AppError
 */
export function parseSupabaseError(error: {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}): AppError {
  const message = error.message || 'Database operation failed';
  const code = error.code || 'SUPABASE_ERROR';
  
  // Handle specific Supabase error codes
  if (code === 'PGRST116') {
    return new ApiError('Resource not found', { code: 'NOT_FOUND', statusCode: 404 });
  }
  
  if (code === '23505') {
    return new ValidationError('A record with this value already exists', {
      duplicate: [error.details || 'Duplicate entry'],
    });
  }
  
  if (code === '23503') {
    return new ValidationError('Referenced record does not exist', {
      reference: [error.details || 'Invalid reference'],
    });
  }
  
  if (code === '42501') {
    return new AuthError('Permission denied', { code: 'RLS_VIOLATION' });
  }
  
  if (message.includes('JWT') || message.includes('token')) {
    return new AuthError('Authentication token is invalid or expired', { code: 'INVALID_TOKEN' });
  }
  
  return new ApiError(message, { code, context: { hint: error.hint } });
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Retry helper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt >= maxRetries || !shouldRetry(error, attempt)) {
        throw error;
      }
      
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
