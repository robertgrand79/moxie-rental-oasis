import React from 'react';
import { cn } from '@/lib/utils';

interface FormFieldErrorProps {
  error?: string;
  className?: string;
}

/**
 * Display form field error message with animation
 */
const FormFieldError: React.FC<FormFieldErrorProps> = ({ error, className }) => {
  if (!error) return null;

  return (
    <p 
      className={cn(
        'text-sm text-destructive mt-1.5 animate-in fade-in-0 slide-in-from-top-1',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {error}
    </p>
  );
};

export default FormFieldError;

/**
 * Hook to track form dirty state and warn on navigation
 */
export function useFormDirtyWarning(isDirty: boolean) {
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}

/**
 * Utility to preserve form data in session storage
 */
export const formDataPreserver = {
  save: (formId: string, data: Record<string, any>) => {
    try {
      sessionStorage.setItem(`form_${formId}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  },

  restore: <T extends Record<string, any>>(formId: string): T | null => {
    try {
      const saved = sessionStorage.getItem(`form_${formId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to restore form data:', error);
      return null;
    }
  },

  clear: (formId: string) => {
    sessionStorage.removeItem(`form_${formId}`);
  },
};
