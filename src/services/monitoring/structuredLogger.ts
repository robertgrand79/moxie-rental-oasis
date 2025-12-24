/**
 * Structured Logging Service
 * Provides consistent, searchable logging with context
 */

import { supabase } from '@/integrations/supabase/client';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  duration?: number;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: Date;
  tags: string[];
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  batchSize: number;
  flushInterval: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

class StructuredLogger {
  private static instance: StructuredLogger;
  private config: LoggerConfig = {
    minLevel: 'info',
    enableConsole: true,
    enableRemote: true,
    batchSize: 50,
    flushInterval: 10000,
  };
  private logQueue: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private globalContext: LogContext = {};

  private constructor() {
    this.startFlushTimer();
  }

  static getInstance(): StructuredLogger {
    if (!StructuredLogger.instance) {
      StructuredLogger.instance = new StructuredLogger();
    }
    return StructuredLogger.instance;
  }

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  setGlobalContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log('error', message, {
      ...context,
      error: error?.message,
      stack: error?.stack,
    });
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log('fatal', message, {
      ...context,
      error: error?.message,
      stack: error?.stack,
    });
  }

  // Specialized logging methods
  logApiRequest(method: string, url: string, duration: number, status: number, context?: LogContext): void {
    this.info(`API ${method} ${url}`, {
      ...context,
      component: 'api',
      action: 'request',
      method,
      url,
      duration,
      status,
    });
  }

  logDatabaseQuery(query: string, duration: number, rowCount?: number, context?: LogContext): void {
    const level = duration > 1000 ? 'warn' : 'debug';
    this.log(level, `Database query`, {
      ...context,
      component: 'database',
      action: 'query',
      query: query.substring(0, 200),
      duration,
      rowCount,
      slow: duration > 1000,
    });
  }

  logUserAction(action: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      ...context,
      component: 'user',
      action,
    });
  }

  logSecurityEvent(eventType: string, risk: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const level = risk === 'critical' || risk === 'high' ? 'warn' : 'info';
    this.log(level, `Security event: ${eventType}`, {
      ...context,
      component: 'security',
      eventType,
      risk,
    });
  }

  logPerformance(metric: string, value: number, context?: LogContext): void {
    this.debug(`Performance: ${metric}`, {
      ...context,
      component: 'performance',
      metric,
      value,
    });
  }

  // Create child logger with additional context
  child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context: {
        ...this.globalContext,
        ...context,
      },
      timestamp: new Date(),
      tags: this.extractTags(context),
    };

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    if (this.config.enableRemote) {
      this.queueForRemote(entry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const contextStr = Object.keys(entry.context).length > 0 
      ? JSON.stringify(entry.context) 
      : '';

    const styles = {
      debug: 'color: gray',
      info: 'color: blue',
      warn: 'color: orange',
      error: 'color: red',
      fatal: 'color: red; font-weight: bold',
    };

    console.log(
      `%c[${entry.level.toUpperCase()}] ${timestamp} ${entry.message}`,
      styles[entry.level],
      contextStr ? entry.context : ''
    );
  }

  private queueForRemote(entry: LogEntry): void {
    this.logQueue.push(entry);

    if (this.logQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private extractTags(context?: LogContext): string[] {
    const tags: string[] = [];
    if (context?.component) tags.push(`component:${context.component}`);
    if (context?.action) tags.push(`action:${context.action}`);
    if (context?.userId) tags.push(`user:${context.userId}`);
    return tags;
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const entries = [...this.logQueue];
    this.logQueue = [];

    try {
      await (supabase as any).from('application_logs').insert(
        entries.map(entry => ({
          level: entry.level,
          message: entry.message,
          context: entry.context,
          tags: entry.tags,
          created_at: entry.timestamp.toISOString(),
        }))
      );
    } catch (error) {
      // Re-queue entries on failure
      this.logQueue = [...entries, ...this.logQueue];
      console.error('Failed to flush logs:', error);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

class ChildLogger {
  constructor(
    private parent: StructuredLogger,
    private context: LogContext
  ) {}

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, { ...this.context, ...context });
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, { ...this.context, ...context });
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, { ...this.context, ...context });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.parent.error(message, error, { ...this.context, ...context });
  }
}

export const logger = StructuredLogger.getInstance();
