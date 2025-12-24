import { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { handleApiError, ServiceType } from '@/utils/apiErrorHandler';

interface UseFormSubmitOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  service?: ServiceType;
  preventDoubleSubmit?: boolean;
  resetFormOnSuccess?: boolean;
}

interface UseFormSubmitReturn<T> {
  isSubmitting: boolean;
  submitCount: number;
  lastError: Error | null;
  handleSubmit: (submitFn: () => Promise<T>) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Hook for handling form submissions with loading state, error handling, and double-submit prevention
 */
export function useFormSubmit<T = unknown>(
  options: UseFormSubmitOptions<T> = {}
): UseFormSubmitReturn<T> {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    service = 'general',
    preventDoubleSubmit = true,
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  const submittingRef = useRef(false);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setSubmitCount(0);
    setLastError(null);
    submittingRef.current = false;
  }, []);

  const handleSubmit = useCallback(
    async (submitFn: () => Promise<T>): Promise<T | undefined> => {
      // Prevent double submission
      if (preventDoubleSubmit && submittingRef.current) {
        console.warn('Form submission blocked: already submitting');
        return undefined;
      }

      try {
        setIsSubmitting(true);
        submittingRef.current = true;
        setLastError(null);

        const result = await submitFn();

        setSubmitCount(prev => prev + 1);

        if (successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }

        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setLastError(error);

        handleApiError(error, {
          service,
          showToast: !errorMessage,
        });

        if (errorMessage) {
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }

        onError?.(error);
        return undefined;
      } finally {
        setIsSubmitting(false);
        submittingRef.current = false;
      }
    },
    [onSuccess, onError, successMessage, errorMessage, service, preventDoubleSubmit]
  );

  return {
    isSubmitting,
    submitCount,
    lastError,
    handleSubmit,
    reset,
  };
}

/**
 * Simple hook for tracking async operation state
 */
export function useAsyncOperation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T | undefined> => {
    try {
      setIsLoading(true);
      setError(null);
      return await operation();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return { isLoading, error, execute, reset };
}
