
import { useState, useCallback } from 'react';
import { validateInput } from '@/utils/security';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  slug?: boolean;
  custom?: (value: string) => string | null;
}

interface UseSecureInputReturn {
  value: string;
  error: string | null;
  isValid: boolean;
  setValue: (value: string) => void;
  validate: () => boolean;
  reset: () => void;
}

export const useSecureInput = (
  initialValue: string = '',
  rules: ValidationRules = {}
): UseSecureInputReturn => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const validateValue = useCallback((val: string): string | null => {
    if (rules.required && !val.trim()) {
      return 'This field is required';
    }

    if (val && rules.minLength && val.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }

    if (val && rules.maxLength && val.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }

    if (val && rules.pattern && !rules.pattern.test(val)) {
      return 'Invalid format';
    }

    if (val && rules.email && !validateInput.email(val)) {
      return 'Invalid email address';
    }

    if (val && rules.phone && !validateInput.phoneNumber(val)) {
      return 'Invalid phone number';
    }

    if (val && rules.slug && !validateInput.slug(val)) {
      return 'Invalid slug format (use lowercase letters, numbers, and hyphens only)';
    }

    if (val && rules.custom) {
      return rules.custom(val);
    }

    return null;
  }, [rules]);

  const handleSetValue = useCallback((newValue: string) => {
    setValue(newValue);
    const validationError = validateValue(newValue);
    setError(validationError);
  }, [validateValue]);

  const validate = useCallback((): boolean => {
    const validationError = validateValue(value);
    setError(validationError);
    return validationError === null;
  }, [value, validateValue]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    error,
    isValid: error === null && (value.trim() !== '' || !rules.required),
    setValue: handleSetValue,
    validate,
    reset
  };
};
