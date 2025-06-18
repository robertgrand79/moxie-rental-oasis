
import { supabase } from '@/integrations/supabase/client';
import { SystemHealth } from './types';

export class SystemMonitorService {
  async getSystemHealth(): Promise<SystemHealth> {
    const healthChecks = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkStorageHealth(),
      this.measureResponseTime()
    ]);

    const databaseHealth = healthChecks[0].status === 'fulfilled' ? healthChecks[0].value : 'down';
    const storageHealth = healthChecks[1].status === 'fulfilled' ? healthChecks[1].value : 'down';
    const responseTime = healthChecks[2].status === 'fulfilled' ? healthChecks[2].value : 5000;

    return {
      uptime: 99.9, // This would come from an external monitoring service
      responseTime,
      errorRate: 0.1, // This would be calculated from error logs
      databaseHealth: databaseHealth as 'healthy' | 'degraded' | 'down',
      storageHealth: storageHealth as 'healthy' | 'degraded' | 'down'
    };
  }

  private async checkDatabaseHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('site_settings').select('key').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) return 'down';
      if (responseTime > 2000) return 'degraded';
      return 'healthy';
    } catch {
      return 'down';
    }
  }

  private async checkStorageHealth(): Promise<'healthy' | 'degraded' | 'down'> {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.storage.from('properties').list('', { limit: 1 });
      const responseTime = Date.now() - startTime;
      
      if (error) return 'down';
      if (responseTime > 2000) return 'degraded';
      return 'healthy';
    } catch {
      return 'down';
    }
  }

  private async measureResponseTime(): Promise<number> {
    const startTime = Date.now();
    try {
      await supabase.from('site_settings').select('key').limit(1);
      return Date.now() - startTime;
    } catch {
      return 5000; // Return high response time on error
    }
  }
}
