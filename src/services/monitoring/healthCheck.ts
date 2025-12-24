/**
 * Health Check Service
 * Monitors application health and endpoint availability
 */

import { supabase } from '@/integrations/supabase/client';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: HealthCheckResult[];
  uptime: number;
  version?: string;
}

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  responseTime?: number;
  message?: string;
  lastChecked: Date;
}

interface HealthCheckConfig {
  interval: number;
  timeout: number;
  endpoints: EndpointConfig[];
}

interface EndpointConfig {
  name: string;
  url: string;
  method?: 'GET' | 'POST';
  expectedStatus?: number;
  timeout?: number;
}

class HealthCheckService {
  private static instance: HealthCheckService;
  private config: HealthCheckConfig = {
    interval: 60000, // 1 minute
    timeout: 5000,
    endpoints: [],
  };
  private results: Map<string, HealthCheckResult> = new Map();
  private checkInterval: NodeJS.Timeout | null = null;
  private startTime: Date;
  private listeners: ((status: HealthStatus) => void)[] = [];

  private constructor() {
    this.startTime = new Date();
  }

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  configure(config: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...config };
  }

  addEndpoint(endpoint: EndpointConfig): void {
    this.config.endpoints.push(endpoint);
  }

  start(): void {
    if (this.checkInterval) return;

    // Run initial check
    this.runAllChecks();

    // Schedule periodic checks
    this.checkInterval = setInterval(() => {
      this.runAllChecks();
    }, this.config.interval);

    console.log('🏥 Health Check Service started');
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  subscribe(listener: (status: HealthStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async runAllChecks(): Promise<HealthStatus> {
    const checks: HealthCheckResult[] = [];

    // Run built-in checks
    checks.push(await this.checkDatabase());
    checks.push(await this.checkStorage());
    checks.push(await this.checkAuth());

    // Run custom endpoint checks
    for (const endpoint of this.config.endpoints) {
      checks.push(await this.checkEndpoint(endpoint));
    }

    // Store results
    for (const check of checks) {
      this.results.set(check.name, check);
    }

    const status = this.getStatus();

    // Notify listeners
    for (const listener of this.listeners) {
      listener(status);
    }

    // Persist status if degraded or unhealthy
    if (status.status !== 'healthy') {
      await this.persistStatus(status);
    }

    return status;
  }

  getStatus(): HealthStatus {
    const checks = Array.from(this.results.values());
    const hasFailure = checks.some(c => c.status === 'fail');
    const hasWarning = checks.some(c => c.status === 'warn');

    return {
      status: hasFailure ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
      timestamp: new Date(),
      checks,
      uptime: Date.now() - this.startTime.getTime(),
      version: import.meta.env.VITE_APP_VERSION || 'unknown',
    };
  }

  getCheckResult(name: string): HealthCheckResult | undefined {
    return this.results.get(name);
  }

  private async checkDatabase(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const { error } = await supabase
        .from('api_status')
        .select('id')
        .limit(1)
        .single();

      const responseTime = Date.now() - startTime;

      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        return {
          name: 'database',
          status: 'fail',
          responseTime,
          message: error.message,
          lastChecked: new Date(),
        };
      }

      return {
        name: 'database',
        status: responseTime > 1000 ? 'warn' : 'pass',
        responseTime,
        message: responseTime > 1000 ? 'Slow response' : undefined,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }

  private async checkStorage(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const { error } = await supabase.storage.listBuckets();
      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          name: 'storage',
          status: 'fail',
          responseTime,
          message: error.message,
          lastChecked: new Date(),
        };
      }

      return {
        name: 'storage',
        status: responseTime > 2000 ? 'warn' : 'pass',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'storage',
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }

  private async checkAuth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    try {
      const { error } = await supabase.auth.getSession();
      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          name: 'auth',
          status: 'warn', // Auth might just mean no session
          responseTime,
          message: error.message,
          lastChecked: new Date(),
        };
      }

      return {
        name: 'auth',
        status: 'pass',
        responseTime,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        name: 'auth',
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date(),
      };
    }
  }

  private async checkEndpoint(endpoint: EndpointConfig): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timeout = endpoint.timeout || this.config.timeout;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint.url, {
        method: endpoint.method || 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const expectedStatus = endpoint.expectedStatus || 200;
      const isExpectedStatus = response.status === expectedStatus;

      return {
        name: endpoint.name,
        status: isExpectedStatus ? (responseTime > 2000 ? 'warn' : 'pass') : 'fail',
        responseTime,
        message: !isExpectedStatus ? `Expected ${expectedStatus}, got ${response.status}` : undefined,
        lastChecked: new Date(),
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const message = error instanceof Error 
        ? (error.name === 'AbortError' ? 'Request timeout' : error.message)
        : 'Unknown error';

      return {
        name: endpoint.name,
        status: 'fail',
        responseTime,
        message,
        lastChecked: new Date(),
      };
    }
  }

  private async persistStatus(status: HealthStatus): Promise<void> {
    try {
      await (supabase as any).from('health_check_logs').insert({
        status: status.status,
        checks: status.checks,
        uptime: status.uptime,
      });
    } catch (error) {
      console.error('Failed to persist health status:', error);
    }
  }
}

export const healthCheck = HealthCheckService.getInstance();
