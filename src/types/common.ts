/**
 * Common type definitions used across the application
 * These replace generic `any` types with proper, typed structures
 */

// Generic JSON-compatible types for database storage
export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// API/Platform data that can have varied structures
export type PlatformData = JsonObject;

// Generic metadata type for extensible records
export type Metadata = Record<string, JsonValue>;

// Settings value type (can be string, number, boolean, or structured data)
export type SettingValue = string | number | boolean | JsonObject | JsonArray | null;

// Email verification details
export interface EmailVerificationDetails {
  verified: boolean;
  verifiedAt?: string;
  method?: 'resend' | 'sendgrid' | 'smtp';
  domain?: string;
  error?: string;
}

// API credentials structure for external services
export interface ApiCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  [key: string]: string | undefined;
}

// Pricing rule conditions
export interface PricingConditions {
  dateRange?: { start: string; end: string };
  daysOfWeek?: number[];
  minimumStay?: number;
  occupancyThreshold?: number;
  advanceBookingDays?: number;
  eventName?: string;
  [key: string]: JsonValue | undefined;
}

// Sync log details
export interface SyncLogDetails {
  itemsProcessed?: number;
  itemsCreated?: number;
  itemsUpdated?: number;
  itemsDeleted?: number;
  errors?: string[];
  warnings?: string[];
  duration?: number;
  [key: string]: JsonValue | undefined;
}

// Permission audit log details
export interface AuditLogDetails {
  previousValue?: JsonValue;
  newValue?: JsonValue;
  reason?: string;
  affectedUsers?: string[];
  ipAddress?: string;
  userAgent?: string;
  [key: string]: JsonValue | undefined;
}

// Security event details
export interface SecurityEventDetails {
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  errorMessage?: string;
  attemptCount?: number;
  [key: string]: JsonValue | undefined;
}

// Analytics metric value
export type MetricValue = number | string | boolean | {
  count?: number;
  value?: number;
  percentage?: number;
  breakdown?: Record<string, number>;
  [key: string]: JsonValue | undefined;
};

// Performance budget settings
export interface PerformanceBudget {
  maxImageSize?: number;
  maxTotalSize?: number;
  maxLoadTime?: number;
  targetFPS?: number;
  [key: string]: number | undefined;
}

// Error tracker metadata
export interface ErrorMetadata {
  userId?: string;
  sessionId?: string;
  organizationId?: string;
  propertyId?: string;
  route?: string;
  component?: string;
  action?: string;
  [key: string]: string | undefined;
}

// Breadcrumb data
export interface BreadcrumbData {
  category?: string;
  message?: string;
  level?: 'info' | 'warning' | 'error';
  data?: JsonObject;
  [key: string]: JsonValue | undefined;
}
