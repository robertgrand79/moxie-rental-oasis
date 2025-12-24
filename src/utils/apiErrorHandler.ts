import { toast } from '@/hooks/use-toast';
import { enhanceErrorMessage, ErrorContext } from './errorMessages';

export type ServiceType = 
  | 'payment' 
  | 'ai' 
  | 'email' 
  | 'storage' 
  | 'database' 
  | 'calendar' 
  | 'pricing'
  | 'general';

interface ServiceConfig {
  name: string;
  friendlyName: string;
  retryable: boolean;
  maxRetries: number;
  retryDelay: number;
}

const SERVICE_CONFIG: Record<ServiceType, ServiceConfig> = {
  payment: {
    name: 'payment',
    friendlyName: 'Payment Processing',
    retryable: true,
    maxRetries: 2,
    retryDelay: 2000,
  },
  ai: {
    name: 'ai',
    friendlyName: 'AI Assistant',
    retryable: true,
    maxRetries: 3,
    retryDelay: 1000,
  },
  email: {
    name: 'email',
    friendlyName: 'Email Service',
    retryable: true,
    maxRetries: 3,
    retryDelay: 1500,
  },
  storage: {
    name: 'storage',
    friendlyName: 'File Storage',
    retryable: true,
    maxRetries: 2,
    retryDelay: 1000,
  },
  database: {
    name: 'database',
    friendlyName: 'Database',
    retryable: true,
    maxRetries: 2,
    retryDelay: 1000,
  },
  calendar: {
    name: 'calendar',
    friendlyName: 'Calendar Sync',
    retryable: true,
    maxRetries: 2,
    retryDelay: 2000,
  },
  pricing: {
    name: 'pricing',
    friendlyName: 'Dynamic Pricing',
    retryable: true,
    maxRetries: 2,
    retryDelay: 2000,
  },
  general: {
    name: 'general',
    friendlyName: 'Service',
    retryable: true,
    maxRetries: 2,
    retryDelay: 1000,
  },
};

interface ApiErrorOptions {
  service?: ServiceType;
  context?: ErrorContext;
  showToast?: boolean;
  logError?: boolean;
}

interface ApiErrorResult {
  message: string;
  actionable: string;
  isRetryable: boolean;
  service: string;
}

/**
 * Handle API errors with user-friendly messages and optional retry logic
 */
export const handleApiError = (
  error: Error | unknown,
  options: ApiErrorOptions = {}
): ApiErrorResult => {
  const { 
    service = 'general', 
    context, 
    showToast = true, 
    logError = true 
  } = options;

  const config = SERVICE_CONFIG[service];
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  const enhanced = enhanceErrorMessage(errorMessage, {
    ...context,
    resource: config.friendlyName,
  });

  if (logError) {
    console.error(`[${config.name.toUpperCase()}] API Error:`, {
      message: errorMessage,
      service: config.name,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  if (showToast) {
    toast({
      title: enhanced.message,
      description: enhanced.actionable,
      variant: 'destructive',
    });
  }

  return {
    message: enhanced.message,
    actionable: enhanced.actionable,
    isRetryable: config.retryable,
    service: config.friendlyName,
  };
};

/**
 * Retry wrapper for async operations with exponential backoff
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
    service?: ServiceType;
  } = {}
): Promise<T> => {
  const config = SERVICE_CONFIG[options.service || 'general'];
  const maxRetries = options.maxRetries ?? config.maxRetries;
  const delayMs = options.delayMs ?? config.retryDelay;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = delayMs * Math.pow(2, attempt);
        options.onRetry?.(attempt + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

/**
 * Create service-specific error handlers
 */
export const createServiceErrorHandler = (service: ServiceType) => {
  return (error: Error | unknown, context?: ErrorContext) => 
    handleApiError(error, { service, context });
};

// Pre-configured error handlers for common services
export const paymentError = createServiceErrorHandler('payment');
export const aiError = createServiceErrorHandler('ai');
export const emailError = createServiceErrorHandler('email');
export const storageError = createServiceErrorHandler('storage');
export const databaseError = createServiceErrorHandler('database');
export const calendarError = createServiceErrorHandler('calendar');
export const pricingError = createServiceErrorHandler('pricing');

/**
 * Check if an error is a network/connectivity issue
 */
export const isNetworkError = (error: Error | unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('NetworkError') ||
    message.includes('Failed to fetch') ||
    message.includes('Network request failed')
  );
};

/**
 * Check if an error is a timeout
 */
export const isTimeoutError = (error: Error | unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('timeout') ||
    message.includes('Timeout') ||
    message.includes('ETIMEDOUT')
  );
};

/**
 * Check if an error is rate limiting
 */
export const isRateLimitError = (error: Error | unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('429')
  );
};
