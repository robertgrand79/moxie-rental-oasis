import { z } from 'zod';

/**
 * Common validation schemas for form fields
 */
export const validationSchemas = {
  // Email validation
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),

  // Password validation
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  // Name validation
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  // Phone validation
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-+()]+$/.test(val),
      'Please enter a valid phone number'
    )
    .refine(
      (val) => !val || val.replace(/\D/g, '').length >= 10,
      'Phone number must have at least 10 digits'
    ),

  // URL validation
  url: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      'Please enter a valid URL starting with http:// or https://'
    ),

  // Slug validation
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be less than 100 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),

  // Price validation
  price: z
    .number()
    .min(0, 'Price cannot be negative')
    .max(100000, 'Price must be less than $100,000'),

  // Percentage validation
  percentage: z
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),

  // Text content validation
  shortText: z
    .string()
    .min(1, 'This field is required')
    .max(200, 'Must be less than 200 characters'),

  longText: z
    .string()
    .min(1, 'This field is required')
    .max(5000, 'Must be less than 5000 characters'),

  // Description validation
  description: z
    .string()
    .max(10000, 'Description must be less than 10,000 characters')
    .optional(),

  // Date validation
  futureDate: z
    .string()
    .refine(
      (val) => !val || new Date(val) > new Date(),
      'Date must be in the future'
    ),

  pastDate: z
    .string()
    .refine(
      (val) => !val || new Date(val) < new Date(),
      'Date must be in the past'
    ),
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Validate file upload
 */
export const validateFile = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } => {
  const { maxSize = 10 * 1024 * 1024, allowedTypes } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`,
    };
  }

  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Common image upload validation
 */
export const validateImageFile = (file: File) => {
  return validateFile(file, {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  });
};

/**
 * Common document upload validation
 */
export const validateDocumentFile = (file: File) => {
  return validateFile(file, {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
  });
};

/**
 * Format validation error for display
 */
export const formatValidationError = (errors: Record<string, any>): string => {
  const messages: string[] = [];
  
  const extractMessages = (obj: Record<string, any>, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      if (value?.message) {
        messages.push(`${prefix}${key}: ${value.message}`);
      } else if (typeof value === 'object') {
        extractMessages(value, `${prefix}${key}.`);
      }
    }
  };

  extractMessages(errors);
  return messages.join(', ');
};

/**
 * Check if a string contains potentially dangerous content
 */
export const containsDangerousContent = (input: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /vbscript:/i,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(input));
};

/**
 * Safe string search - handles null/undefined values
 * @param value - The string value to search in (may be null/undefined)
 * @param searchTerm - The term to search for
 * @returns boolean - Whether the search term was found
 */
export const safeSearchIncludes = (
  value: string | null | undefined,
  searchTerm: string
): boolean => {
  if (!value || !searchTerm) return false;
  return value.toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Safe string for toLowerCase - returns empty string for null/undefined
 */
export const safeToLower = (value: string | null | undefined): string => {
  return value?.toLowerCase() || '';
};

/**
 * Multi-field safe search - check if any field contains the search term
 */
export const safeSearchAny = (
  searchTerm: string,
  ...values: (string | null | undefined)[]
): boolean => {
  if (!searchTerm?.trim()) return true;
  const lowerSearch = searchTerm.toLowerCase();
  return values.some(value => (value?.toLowerCase() || '').includes(lowerSearch));
};
