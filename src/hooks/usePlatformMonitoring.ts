import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

// Feature Flags
export interface FeatureFlag {
  id: string;
  flag_key: string;
  flag_name: string;
  description: string | null;
  is_enabled: boolean;
  target_type: 'all' | 'tier' | 'organization' | 'percentage';
  target_tiers: string[] | null;
  target_organization_ids: string[] | null;
  target_percentage: number | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface SlaDefinition {
  id: string;
  sla_name: string;
  sla_type: 'uptime' | 'response_time' | 'resolution_time' | 'support_response';
  target_value: number;
  target_unit: 'percent' | 'minutes' | 'hours' | 'days';
  applies_to_tiers: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlaBreach {
  id: string;
  organization_id: string;
  sla_definition_id: string;
  breach_start: string;
  breach_end: string | null;
  severity: 'warning' | 'critical' | 'resolved';
  actual_value: number;
  target_value: number;
  notified_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  organization?: {
    name: string;
  };
  sla_definition?: SlaDefinition;
}

export interface PerformanceMetric {
  id: string;
  organization_id: string;
  metric_type: 'api_latency' | 'error_rate' | 'request_count' | 'storage_usage' | 'bandwidth' | 'active_users';
  metric_value: number;
  metric_unit: string;
  endpoint: string | null;
  recorded_at: string;
  metadata: Json;
  organization?: {
    name: string;
  };
}

export const usePlatformFeatureFlags = () => {
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['platform-feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_feature_flags')
        .select('*')
        .order('flag_name');
      if (error) throw error;
      return data as FeatureFlag[];
    },
  });

  const updateFlag = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { is_enabled?: boolean; target_tiers?: string[] | null } }) => {
      const { error } = await supabase
        .from('platform_feature_flags')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-feature-flags'] });
      toast.success('Feature flag updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update flag: ${error.message}`);
    },
  });

  const createFlag = useMutation({
    mutationFn: async (flag: { flag_key: string; flag_name: string; description?: string; is_enabled?: boolean; target_type?: string; target_tiers?: string[] }) => {
      const { error } = await supabase
        .from('platform_feature_flags')
        .insert(flag);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-feature-flags'] });
      toast.success('Feature flag created');
    },
  });

  return { flags, isLoading, updateFlag, createFlag };
};

export const usePlatformSlaDefinitions = () => {
  const queryClient = useQueryClient();

  const { data: definitions = [], isLoading } = useQuery({
    queryKey: ['platform-sla-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_sla_definitions')
        .select('*')
        .order('sla_name');
      if (error) throw error;
      return data as SlaDefinition[];
    },
  });

  const updateDefinition = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SlaDefinition> }) => {
      const { error } = await supabase
        .from('platform_sla_definitions')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-sla-definitions'] });
      toast.success('SLA definition updated');
    },
  });

  return { definitions, isLoading, updateDefinition };
};

export const usePlatformSlaBreaches = () => {
  const queryClient = useQueryClient();

  const { data: breaches = [], isLoading } = useQuery({
    queryKey: ['platform-sla-breaches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_sla_breaches')
        .select(`
          *,
          organization:organizations(name),
          sla_definition:platform_sla_definitions(*)
        `)
        .order('breach_start', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as SlaBreach[];
    },
  });

  const activeBreaches = breaches.filter(b => !b.resolved_at);
  const criticalBreaches = activeBreaches.filter(b => b.severity === 'critical');

  const resolveBreach = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await supabase
        .from('platform_sla_breaches')
        .update({
          resolved_at: new Date().toISOString(),
          severity: 'resolved',
          resolution_notes: notes,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-sla-breaches'] });
      toast.success('Breach marked as resolved');
    },
  });

  return { breaches, activeBreaches, criticalBreaches, isLoading, resolveBreach };
};

export const usePlatformPerformanceMetrics = (timeRange: '1h' | '24h' | '7d' | '30d' = '24h') => {
  const getStartTime = (range: typeof timeRange) => {
    const now = new Date();
    switch (range) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['platform-performance-metrics', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_performance_metrics')
        .select(`
          *,
          organization:organizations(name)
        `)
        .gte('recorded_at', getStartTime(timeRange).toISOString())
        .order('recorded_at', { ascending: false });
      if (error) throw error;
      return data as PerformanceMetric[];
    },
  });

  // Aggregate metrics by type
  const aggregatedMetrics = {
    avgLatency: metrics
      .filter(m => m.metric_type === 'api_latency')
      .reduce((sum, m, _, arr) => sum + m.metric_value / arr.length, 0),
    errorRate: metrics
      .filter(m => m.metric_type === 'error_rate')
      .reduce((sum, m, _, arr) => sum + m.metric_value / arr.length, 0),
    totalRequests: metrics
      .filter(m => m.metric_type === 'request_count')
      .reduce((sum, m) => sum + m.metric_value, 0),
    activeUsers: metrics
      .filter(m => m.metric_type === 'active_users')
      .reduce((max, m) => Math.max(max, m.metric_value), 0),
  };

  return { metrics, aggregatedMetrics, isLoading };
};

export const useSendBreachAlert = () => {
  return useMutation({
    mutationFn: async (breachId: string) => {
      const response = await supabase.functions.invoke('sla-breach-alert', {
        body: { breachId },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast.success('Alert sent successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to send alert: ${error.message}`);
    },
  });
};
