import { useCallback } from 'react';
import { toast } from 'sonner';
import { 
  AppError, 
  AuthError, 
  ValidationError, 
  NetworkError,
  RateLimitError,
  normalizeError,
  getErrorMessage,
  isAppError 
} from '@/utils/errors';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  context?: string;
  onAuthError?: () => void;
  onNetworkError?: () => void;
  onRateLimitError?: (retryAfter?: number) => void;
}

/**
 * Hook for centralized error handling in components
 */
export function useErrorHandler(defaultOptions: ErrorHandlerOptions = {}) {
  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ): AppError => {
    const mergedOptions = { ...defaultOptions, ...options };
    const {
      showToast = true,
      logError = true,
      context = 'Component',
      onAuthError,
      onNetworkError,
      onRateLimitError,
    } = mergedOptions;

    const appError = normalizeError(error);

    // Log error
    if (logError) {
      console.error(`[${context}] Error:`, {
        code: appError.code,
        message: appError.message,
        context: appError.context,
      });
    }

    // Handle specific error types
    if (appError instanceof AuthError) {
      onAuthError?.();
      if (showToast) {
        toast.error('Authentication Error', {
          description: appError.message,
        });
      }
    } else if (appError instanceof NetworkError) {
      onNetworkError?.();
      if (showToast) {
        toast.error('Connection Error', {
          description: 'Please check your internet connection and try again.',
        });
      }
    } else if (appError instanceof RateLimitError) {
      onRateLimitError?.(appError.retryAfter);
      if (showToast) {
        toast.error('Too Many Requests', {
          description: appError.retryAfter 
            ? `Please wait ${appError.retryAfter} seconds before trying again.`
            : 'Please wait a moment before trying again.',
        });
      }
    } else if (appError instanceof ValidationError) {
      if (showToast) {
        const fieldErrors = Object.entries(appError.fields)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n');
        
        toast.error('Validation Error', {
          description: fieldErrors || appError.message,
        });
      }
    } else {
      if (showToast) {
        toast.error('Error', {
          description: appError.message,
        });
      }
    }

    return appError;
  }, [defaultOptions]);

  const tryCatch = useCallback(async <T>(
    fn: () => Promise<T>,
    options: ErrorHandlerOptions = {}
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }, [handleError]);

  const wrapAsync = useCallback(<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    options: ErrorHandlerOptions = {}
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, options);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleError,
    tryCatch,
    wrapAsync,
    getErrorMessage,
    isAppError,
  };
}
