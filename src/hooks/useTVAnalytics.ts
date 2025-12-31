import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, format } from 'date-fns';

export interface TVAnalyticsData {
  totalDevices: number;
  pairedDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  recentActivity: AuditLogEntry[];
  dailyActiveDevices: DailyActiveCount[];
  devicesByProperty: PropertyDeviceCount[];
}

export interface AuditLogEntry {
  id: string;
  device_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
  device_name?: string;
  property_name?: string;
}

export interface DailyActiveCount {
  date: string;
  count: number;
}

export interface PropertyDeviceCount {
  property_id: string;
  property_name: string;
  total: number;
  paired: number;
  online: number;
}

/**
 * useTVAnalytics - Hook for fetching TV device analytics data
 */
export const useTVAnalytics = (organizationId: string | undefined) => {
  return useQuery<TVAnalyticsData>({
    queryKey: ['tv-analytics', organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error('Organization ID required');

      // Fetch all devices with property info
      const { data: devices, error: devicesError } = await supabase
        .from('tv_device_pairings')
        .select(`
          id,
          device_id,
          device_name,
          is_paired,
          last_seen_at,
          property_id,
          properties!inner(id, title)
        `)
        .eq('organization_id', organizationId);

      if (devicesError) throw devicesError;

      // Fetch recent audit logs
      const { data: auditLogs, error: auditError } = await supabase
        .from('tv_pairing_audit_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (auditError) throw auditError;

      // Calculate metrics
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const totalDevices = devices?.length || 0;
      const pairedDevices = devices?.filter(d => d.is_paired).length || 0;
      const onlineDevices = devices?.filter(d => 
        d.last_seen_at && new Date(d.last_seen_at) > fiveMinutesAgo
      ).length || 0;
      const offlineDevices = totalDevices - onlineDevices;

      // Calculate devices by property
      const propertyMap = new Map<string, PropertyDeviceCount>();
      devices?.forEach(device => {
        const propertyId = device.property_id;
        const propertyData = device.properties as any;
        const propertyName = propertyData?.title || 'Unknown Property';
        
        if (!propertyMap.has(propertyId)) {
          propertyMap.set(propertyId, {
            property_id: propertyId,
            property_name: propertyName,
            total: 0,
            paired: 0,
            online: 0,
          });
        }
        
        const stats = propertyMap.get(propertyId)!;
        stats.total++;
        if (device.is_paired) stats.paired++;
        if (device.last_seen_at && new Date(device.last_seen_at) > fiveMinutesAgo) {
          stats.online++;
        }
      });

      // Calculate daily active devices for the last 7 days
      const dailyActiveDevices: DailyActiveCount[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = startOfDay(subDays(now, i));
        const nextDate = startOfDay(subDays(now, i - 1));
        
        const activeCount = devices?.filter(d => {
          if (!d.last_seen_at) return false;
          const lastSeen = new Date(d.last_seen_at);
          return lastSeen >= date && lastSeen < nextDate;
        }).length || 0;
        
        dailyActiveDevices.push({
          date: format(date, 'MMM d'),
          count: activeCount,
        });
      }

      // Enrich audit logs with device/property names
      const enrichedLogs: AuditLogEntry[] = (auditLogs || []).map(log => {
        const device = devices?.find(d => d.id === log.device_pairing_id);
        const propertyData = device?.properties as any;
        return {
          id: log.id,
          device_id: log.device_pairing_id,
          action: log.action,
          details: (log.details as Record<string, any>) || {},
          created_at: log.created_at,
          device_name: device?.device_name || 'Unknown Device',
          property_name: propertyData?.title || 'Unknown Property',
        };
      });

      return {
        totalDevices,
        pairedDevices,
        onlineDevices,
        offlineDevices,
        recentActivity: enrichedLogs,
        dailyActiveDevices,
        devicesByProperty: Array.from(propertyMap.values()),
      };
    },
    enabled: !!organizationId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export default useTVAnalytics;
