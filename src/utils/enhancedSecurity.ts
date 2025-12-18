import { supabase } from '@/integrations/supabase/client';

// Enhanced rate limiting with database backend
export const checkRateLimit = async (
  operation: string, 
  identifier: string, 
  maxRequests: number = 10, 
  windowMinutes: number = 60
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      operation_type: operation,
      identifier,
      max_requests: maxRequests,
      window_minutes: windowMinutes
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      return false; // Fail closed
    }

    return data === true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false; // Fail closed
  }
};

// Security headers middleware
export const addSecurityHeaders = (): void => {
  // Content Security Policy
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' 
      https://*.googletagmanager.com 
      https://*.google-analytics.com 
      https://*.stripe.com;
    connect-src 'self' 
      https://*.supabase.co 
      https://*.google-analytics.com 
      https://*.stripe.com
      https://api.mapbox.com
      https://*.mapbox.com
      https://*.tiles.mapbox.com
      https://events.mapbox.com;
    frame-src 'self' 
      https://*.stripe.com;
    img-src 'self' data: blob: https:
      https://*.supabase.co
      https://*.googletagmanager.com 
      https://*.google-analytics.com
      https://*.mapbox.com;
    style-src 'self' 'unsafe-inline' 
      https://fonts.googleapis.com;
    font-src 'self' 
      https://fonts.gstatic.com;
    worker-src 'self' blob:;
    child-src 'self' blob:;
  `.replace(/\s+/g, ' ').trim();
  
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    document.head.appendChild(cspMeta);
  }

  // X-Frame-Options
  const frameMeta = document.createElement('meta');
  frameMeta.httpEquiv = 'X-Frame-Options';
  frameMeta.content = 'DENY';
  
  if (!document.querySelector('meta[http-equiv="X-Frame-Options"]')) {
    document.head.appendChild(frameMeta);
  }

  // X-Content-Type-Options
  const contentTypeMeta = document.createElement('meta');
  contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
  contentTypeMeta.content = 'nosniff';
  
  if (!document.querySelector('meta[http-equiv="X-Content-Type-Options"]')) {
    document.head.appendChild(contentTypeMeta);
  }
};

// Enhanced input validation
export const validateSecureInput = (input: string, type: 'email' | 'name' | 'message' | 'phone'): { 
  isValid: boolean; 
  error?: string; 
  sanitized: string 
} => {
  // Basic XSS protection
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];

  const hasXSS = xssPatterns.some(pattern => pattern.test(input));
  if (hasXSS) {
    return { isValid: false, error: 'Invalid characters detected', sanitized: '' };
  }

  const sanitized = input.trim().replace(/[<>'"]/g, '');

  switch (type) {
    case 'email':
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(sanitized)) {
        return { isValid: false, error: 'Invalid email format', sanitized };
      }
      if (sanitized.length > 254) {
        return { isValid: false, error: 'Email too long', sanitized };
      }
      break;

    case 'name':
      if (sanitized.length === 0 || sanitized.length > 100) {
        return { isValid: false, error: 'Name must be 1-100 characters', sanitized };
      }
      const nameRegex = /^[a-zA-Z\s\-']+$/;
      if (!nameRegex.test(sanitized)) {
        return { isValid: false, error: 'Invalid characters in name', sanitized };
      }
      break;

    case 'message':
      if (sanitized.length < 10 || sanitized.length > 5000) {
        return { isValid: false, error: 'Message must be 10-5000 characters', sanitized };
      }
      break;

    case 'phone':
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,20}$/;
      if (!phoneRegex.test(sanitized)) {
        return { isValid: false, error: 'Invalid phone format', sanitized };
      }
      break;

    default:
      if (sanitized.length > 1000) {
        return { isValid: false, error: 'Input too long', sanitized };
      }
  }

  return { isValid: true, sanitized };
};

// IP-based rate limiting identifier
export const getClientIdentifier = (): string => {
  // In a real app, you'd get the actual IP from headers
  // For client-side, we'll use a session-based identifier
  let identifier = sessionStorage.getItem('client_id');
  if (!identifier) {
    identifier = crypto.randomUUID();
    sessionStorage.setItem('client_id', identifier);
  }
  return identifier;
};