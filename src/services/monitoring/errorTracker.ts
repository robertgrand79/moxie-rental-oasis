/**
 * Centralized Error Tracking Service
 * Provides error capture, context enrichment, and alerting capabilities
 */

import { supabase } from '@/integrations/supabase/client';
import { debug } from '@/utils/debug';

export interface ErrorContext {
  userId?: string;
  tenantId?: string;
  organizationId?: string;
  sessionId?: string;
  page?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  type: 'error' | 'warning' | 'unhandled_rejection' | 'network' | 'api';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
  timestamp: Date;
  fingerprint: string;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
  resolved: boolean;
  tags: string[];
}

interface ErrorConfig {
  captureUnhandled: boolean;
  captureNetworkErrors: boolean;
  sampleRate: number; // 0-1, percentage of errors to capture
  maxBreadcrumbs: number;
  ignorePatterns: RegExp[];
  alertThreshold: number; // Alert when same error occurs this many times
}

type Breadcrumb = {
  type: 'navigation' | 'click' | 'api' | 'console' | 'error';
  message: string;
  timestamp: Date;
  data?: Record<string, any>;
};

class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Map<string, TrackedError> = new Map();
  private breadcrumbs: Breadcrumb[] = [];
  private context: ErrorContext = {};
  private config: ErrorConfig = {
    captureUnhandled: true,
    captureNetworkErrors: true,
    sampleRate: 1.0,
    maxBreadcrumbs: 100,
    ignorePatterns: [
      /ResizeObserver loop/i,
      /Script error/i,
      /Loading chunk/i,
    ],
    alertThreshold: 10,
  };
  private initialized = false;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  init(config?: Partial<ErrorConfig>): void {
    if (this.initialized) return;

    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (this.config.captureUnhandled) {
      this.setupGlobalHandlers();
    }

    this.initialized = true;
    debug.log('Error Tracker initialized');
  }

  private setupGlobalHandlers(): void {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        component: 'GlobalErrorHandler',
        action: 'unhandled_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.captureError(error, {
        component: 'PromiseRejectionHandler',
        action: 'unhandled_rejection',
      });
    });

    // Capture console errors - note: we don't wrap console.error to avoid infinite loops
    // The debug utility already handles production-safe logging
  }

  setUser(userId: string, tenantId?: string): void {
    this.context.userId = userId;
    this.context.tenantId = tenantId;
    this.context.sessionId = this.sessionId;
  }

  setOrganization(organizationId: string): void {
    this.context.organizationId = organizationId;
  }

  setPage(page: string): void {
    this.context.page = page;
    this.addBreadcrumb('navigation', `Navigated to ${page}`);
  }

  addBreadcrumb(type: Breadcrumb['type'], message: string, data?: Record<string, any>): void {
    this.breadcrumbs.push({
      type,
      message,
      timestamp: new Date(),
      data,
    });

    // Keep only recent breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }
  }

  captureError(
    error: Error,
    additionalContext?: Partial<ErrorContext>,
    severity: TrackedError['severity'] = 'medium'
  ): string {
    // Check sample rate
    if (Math.random() > this.config.sampleRate) {
      return '';
    }

    // Check ignore patterns
    if (this.config.ignorePatterns.some(pattern => pattern.test(error.message))) {
      return '';
    }

    const fingerprint = this.generateFingerprint(error);
    const now = new Date();

    // Check if we've seen this error before
    const existing = this.errors.get(fingerprint);
    if (existing) {
      existing.count++;
      existing.lastSeen = now;
      this.errors.set(fingerprint, existing);

      // Check alert threshold
      if (existing.count === this.config.alertThreshold) {
        this.triggerAlert(existing);
      }

      return existing.id;
    }

    const trackedError: TrackedError = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      type: this.categorizeError(error),
      severity,
      context: {
        ...this.context,
        ...additionalContext,
      },
      timestamp: now,
      fingerprint,
      count: 1,
      firstSeen: now,
      lastSeen: now,
      resolved: false,
      tags: this.extractTags(error, additionalContext),
    };

    this.errors.set(fingerprint, trackedError);
    this.persistError(trackedError);

    return trackedError.id;
  }

  captureMessage(
    message: string,
    severity: TrackedError['severity'] = 'low',
    additionalContext?: Partial<ErrorContext>
  ): string {
    const error = new Error(message);
    return this.captureError(error, additionalContext, severity);
  }

  captureNetworkError(
    url: string,
    status: number,
    method: string,
    responseBody?: string
  ): string {
    if (!this.config.captureNetworkErrors) return '';

    const error = new Error(`Network Error: ${method} ${url} returned ${status}`);
    return this.captureError(error, {
      action: 'network_request',
      metadata: {
        url,
        status,
        method,
        responseBody: responseBody?.substring(0, 500),
      },
    }, status >= 500 ? 'high' : 'medium');
  }

  private categorizeError(error: Error): TrackedError['type'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('api') || message.includes('endpoint')) {
      return 'api';
    }
    if (error.name === 'UnhandledRejection') {
      return 'unhandled_rejection';
    }
    return 'error';
  }

  private extractTags(error: Error, context?: Partial<ErrorContext>): string[] {
    const tags: string[] = [];

    if (context?.page) {
      tags.push(`page:${context.page}`);
    }
    if (context?.component) {
      tags.push(`component:${context.component}`);
    }
    if (error.name) {
      tags.push(`type:${error.name}`);
    }

    return tags;
  }

  private generateFingerprint(error: Error): string {
    const parts = [
      error.name,
      error.message.replace(/\d+/g, 'N'), // Normalize numbers
      error.stack?.split('\n')[1]?.trim() || '',
    ];
    return btoa(parts.join('|')).substring(0, 32);
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private async persistError(error: TrackedError): Promise<void> {
    try {
      // Log to console for development using debug utility
      debug.error('Error Tracked:', error.id);
      debug.error('Message:', error.message);
      debug.error('Severity:', error.severity);
      debug.log('Context:', error.context);
      debug.log('Breadcrumbs:', this.breadcrumbs.slice(-10));

      // Persist to database using type assertion for dynamic tables
      await (supabase as any).from('error_logs').insert({
        error_id: error.id,
        message: error.message,
        stack: error.stack,
        type: error.type,
        severity: error.severity,
        context: error.context,
        fingerprint: error.fingerprint,
        tags: error.tags,
        breadcrumbs: this.breadcrumbs.slice(-20),
        user_agent: navigator.userAgent,
        url: window.location.href,
      });
    } catch (e) {
      debug.error('Failed to persist error:', e);
    }
  }

  private async triggerAlert(error: TrackedError): Promise<void> {
    debug.warn(`Error threshold reached for: ${error.message} (${error.count} occurrences)`);

    try {
      // Create admin notification
      if (error.context.organizationId) {
        await supabase.from('admin_notifications').insert({
          organization_id: error.context.organizationId,
          notification_type: 'error_alert',
          category: 'system',
          title: 'Recurring Error Detected',
          message: `Error "${error.message}" has occurred ${error.count} times`,
          priority: error.severity === 'critical' ? 'critical' : 'high',
          metadata: {
            errorId: error.id,
            fingerprint: error.fingerprint,
            count: error.count,
          },
        });
      }
    } catch (e) {
      debug.error('Failed to trigger error alert:', e);
    }
  }

  getRecentErrors(limit = 50): TrackedError[] {
    return Array.from(this.errors.values())
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
      .slice(0, limit);
  }

  getErrorById(id: string): TrackedError | undefined {
    return Array.from(this.errors.values()).find(e => e.id === id);
  }

  getErrorStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    recentCount: number;
  } {
    const errors = Array.from(this.errors.values());
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return {
      total: errors.length,
      bySeverity: errors.reduce((acc, e) => {
        acc[e.severity] = (acc[e.severity] || 0) + e.count;
        return acc;
      }, {} as Record<string, number>),
      byType: errors.reduce((acc, e) => {
        acc[e.type] = (acc[e.type] || 0) + e.count;
        return acc;
      }, {} as Record<string, number>),
      recentCount: errors.filter(e => e.lastSeen > oneHourAgo).length,
    };
  }

  markResolved(fingerprint: string): void {
    const error = this.errors.get(fingerprint);
    if (error) {
      error.resolved = true;
      this.errors.set(fingerprint, error);
    }
  }

  clearErrors(): void {
    this.errors.clear();
  }
}

export const errorTracker = ErrorTracker.getInstance();
