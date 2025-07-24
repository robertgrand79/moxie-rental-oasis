
import DOMPurify from 'dompurify';
import { logXSSAttempt, logInvalidInput } from './securityLogger';

// Enhanced Content Security and Sanitization
export const sanitizeHtml = (html: string, userId?: string): string => {
  // Check for potential XSS attempts
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\(/i,
    /expression\(/i
  ];

  const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(html));
  if (hasDangerousContent) {
    logXSSAttempt(html, userId);
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
  });
};

// URL Validation
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Enhanced Input Validation and Sanitization
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  
  slug: (slug: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length <= 100;
  },
  
  textLength: (text: string, maxLength: number = 1000): boolean => {
    return text.length <= maxLength;
  },
  
  phoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;
    return phoneRegex.test(phone);
  },

  // New validation methods
  name: (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s\-']{1,100}$/;
    return nameRegex.test(name) && name.length <= 100;
  },

  message: (message: string): boolean => {
    // Check for potential XSS
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(message)) && 
           message.length <= 5000 && 
           message.trim().length >= 10;
  }
};

// Safe input sanitization for forms
export const sanitizeFormInput = (input: string, field: string, userId?: string): string => {
  // Remove potential XSS
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  // Log suspicious input
  if (input !== sanitized) {
    logInvalidInput(field, input, userId);
  }
  
  return sanitized.trim();
};

// Content Sanitization for Rich Text
export const sanitizeRichTextContent = (content: string, userId?: string): string => {
  // Enhanced XSS detection for rich text
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i
  ];

  const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(content));
  if (hasDangerousContent) {
    logXSSAttempt(content, userId);
  }

  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'blockquote'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    SANITIZE_DOM: true
  });
};

// File Upload Validation
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP files are allowed' };
  }
  
  return { isValid: true };
};

// Rate Limiting Helper
export const createRateLimiter = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, number[]>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    return true;
  };
};
