/**
 * Centralized Error Classes and Utilities
 * Provides typed error handling across the application
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly originalError?: Error;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      isOperational?: boolean;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || 'APP_ERROR';
    this.statusCode = options.statusCode || 500;
    this.isOperational = options.isOperational ?? true;
    this.context = options.context;
    this.timestamp = new Date();
    this.originalError = options.cause;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Authentication errors
 */
export class AuthError extends AppError {
  constructor(
    message: string,
    options: {
      code?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'AUTH_ERROR',
      statusCode: 401,
    });
  }
}

export class SessionExpiredError extends AuthError {
  constructor(context?: Record<string, unknown>) {
    super('Your session has expired. Please sign in again.', {
      code: 'SESSION_EXPIRED',
      context,
    });
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = 'You are not authorized to perform this action.', context?: Record<string, unknown>) {
    super(message, {
      code: 'UNAUTHORIZED',
      context,
    });
  }
}

export class AccountLockedError extends AuthError {
  public readonly lockedUntil?: Date;
  public readonly remainingAttempts?: number;

  constructor(options: {
    lockedUntil?: Date;
    remainingAttempts?: number;
    context?: Record<string, unknown>;
  } = {}) {
    const message = options.lockedUntil
      ? `Account temporarily locked. Please try again after ${options.lockedUntil.toLocaleTimeString()}.`
      : 'Account temporarily locked due to too many failed attempts.';
    
    super(message, {
      code: 'ACCOUNT_LOCKED',
      context: options.context,
    });
    
    this.lockedUntil = options.lockedUntil;
    this.remainingAttempts = options.remainingAttempts;
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string[]>;

  constructor(
    message: string,
    fields: Record<string, string[]> = {},
    context?: Record<string, unknown>
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      context,
    });
    this.fields = fields;
  }

  static fromZodError(zodError: { errors: Array<{ path: (string | number)[]; message: string }> }): ValidationError {
    const fields: Record<string, string[]> = {};
    
    zodError.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!fields[path]) {
        fields[path] = [];
      }
      fields[path].push(err.message);
    });

    return new ValidationError('Validation failed', fields);
  }
}

/**
 * Network/API errors
 */
export class NetworkError extends AppError {
  constructor(
    message = 'Network error. Please check your connection.',
    options: {
      code?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'NETWORK_ERROR',
      statusCode: 0,
    });
  }
}

export class ApiError extends AppError {
  public readonly endpoint?: string;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      endpoint?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'API_ERROR',
      statusCode: options.statusCode || 500,
    });
    this.endpoint = options.endpoint;
  }
}

export class RateLimitError extends ApiError {
  public readonly retryAfter?: number;

  constructor(options: {
    retryAfter?: number;
    endpoint?: string;
    context?: Record<string, unknown>;
  } = {}) {
    super('Too many requests. Please try again later.', {
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      endpoint: options.endpoint,
      context: options.context,
    });
    this.retryAfter = options.retryAfter;
  }
}

/**
 * Database errors
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    options: {
      code?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'DATABASE_ERROR',
      statusCode: 500,
      isOperational: false,
    });
  }
}

export class RecordNotFoundError extends DatabaseError {
  public readonly recordType: string;
  public readonly recordId?: string;

  constructor(recordType: string, recordId?: string, context?: Record<string, unknown>) {
    super(`${recordType} not found${recordId ? `: ${recordId}` : ''}`, {
      code: 'RECORD_NOT_FOUND',
      context,
    });
    this.recordType = recordType;
    this.recordId = recordId;
  }
}

/**
 * Feature/Business logic errors
 */
export class FeatureError extends AppError {
  constructor(
    message: string,
    options: {
      code?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message, {
      ...options,
      code: options.code || 'FEATURE_ERROR',
      statusCode: 400,
    });
  }
}

export class FeatureDisabledError extends FeatureError {
  public readonly featureName: string;

  constructor(featureName: string, context?: Record<string, unknown>) {
    super(`The ${featureName} feature is currently disabled.`, {
      code: 'FEATURE_DISABLED',
      context,
    });
    this.featureName = featureName;
  }
}

export class PermissionDeniedError extends FeatureError {
  public readonly requiredPermission?: string;

  constructor(message = 'You do not have permission to perform this action.', options: {
    requiredPermission?: string;
    context?: Record<string, unknown>;
  } = {}) {
    super(message, {
      code: 'PERMISSION_DENIED',
      context: options.context,
    });
    this.requiredPermission = options.requiredPermission;
  }
}
