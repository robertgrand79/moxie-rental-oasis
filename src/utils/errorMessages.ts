
export interface ErrorContext {
  operation?: string;
  resource?: string;
  details?: Record<string, any>;
}

export interface EnhancedError {
  message: string;
  actionable: string;
  technical?: string;
  recovery?: string[];
}

export const enhanceErrorMessage = (
  error: Error | string,
  context?: ErrorContext
): EnhancedError => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const operation = context?.operation || 'operation';
  const resource = context?.resource || 'resource';

  // Network and connectivity errors
  if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('NetworkError')) {
    return {
      message: `Failed to ${operation} ${resource}`,
      actionable: 'Please check your internet connection and try again.',
      technical: errorMessage,
      recovery: [
        'Check your internet connection',
        'Try refreshing the page',
        'Contact support if the issue persists'
      ]
    };
  }

  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
    return {
      message: `You don't have permission to ${operation} ${resource}`,
      actionable: 'Contact your administrator to request the necessary permissions.',
      technical: errorMessage,
      recovery: [
        'Contact your system administrator',
        'Check if you have the required role',
        'Try logging out and back in'
      ]
    };
  }

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('required')) {
    return {
      message: `Invalid data provided for ${operation}`,
      actionable: 'Please check your input and ensure all required fields are filled correctly.',
      technical: errorMessage,
      recovery: [
        'Review all form fields',
        'Ensure required fields are completed',
        'Check data format requirements'
      ]
    };
  }

  // Database/server errors
  if (errorMessage.includes('database') || errorMessage.includes('server') || errorMessage.includes('500')) {
    return {
      message: `Server error while trying to ${operation} ${resource}`,
      actionable: 'This is a temporary issue. Please try again in a few moments.',
      technical: errorMessage,
      recovery: [
        'Wait a moment and try again',
        'Refresh the page',
        'Contact support if the issue continues'
      ]
    };
  }

  // Conflict errors
  if (errorMessage.includes('conflict') || errorMessage.includes('already exists') || errorMessage.includes('409')) {
    return {
      message: `${resource} already exists`,
      actionable: 'Try using a different name or check if the item already exists.',
      technical: errorMessage,
      recovery: [
        'Use a different name',
        'Check if the item already exists',
        'Remove the existing item first if appropriate'
      ]
    };
  }

  // Rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests') || errorMessage.includes('429')) {
    return {
      message: 'Too many requests',
      actionable: 'Please wait a moment before trying again.',
      technical: errorMessage,
      recovery: [
        'Wait 30 seconds before retrying',
        'Reduce the frequency of requests',
        'Contact support if this continues'
      ]
    };
  }

  // Generic fallback
  return {
    message: `Failed to ${operation} ${resource}`,
    actionable: 'An unexpected error occurred. Please try again or contact support.',
    technical: errorMessage,
    recovery: [
      'Try the operation again',
      'Refresh the page',
      'Contact support with the error details'
    ]
  };
};

export const formatErrorForToast = (
  error: Error | string,
  context?: ErrorContext
): { title: string; description: string; variant?: 'destructive' } => {
  const enhanced = enhanceErrorMessage(error, context);
  
  return {
    title: enhanced.message,
    description: enhanced.actionable,
    variant: 'destructive'
  };
};

export const formatErrorForUser = (
  error: Error | string,
  context?: ErrorContext
): { userMessage: string; technicalDetails: string; suggestions: string[] } => {
  const enhanced = enhanceErrorMessage(error, context);
  
  return {
    userMessage: `${enhanced.message}. ${enhanced.actionable}`,
    technicalDetails: enhanced.technical || 'No technical details available',
    suggestions: enhanced.recovery || []
  };
};
