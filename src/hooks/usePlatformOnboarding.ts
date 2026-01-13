import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TenantHealth {
  organization_id: string;
  organization_name: string;
  slug: string;
  created_at: string;
  subscription_status: string;
  subscription_tier: string;
  current_stage: string;
  onboarding_started_at: string;
  last_activity_at: string;
  onboarding_completed_at: string | null;
  is_stuck: boolean;
  stuck_detected_at: string | null;
  has_properties: number;
  has_guidebook: number;
  has_assistant: number;
  has_recent_bookings: number;
  total_conversations: number;
  conversations_last_7d: number;
  total_bookings: number;
  bookings_last_30d: number;
  health_score: number;
  days_inactive: number;
}

export interface FunnelStage {
  stage: string;
  org_count: number;
  stuck_count: number;
  total_signups: number;
  percentage: number;
  cumulative_percentage: number;
}

export function usePlatformOnboarding() {
  const tenantHealthQuery = useQuery({
    queryKey: ['platform-tenant-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_tenant_health')
        .select('*')
        .order('health_score', { ascending: true });
      if (error) throw error;
      return data as TenantHealth[];
    },
  });

  const funnelQuery = useQuery({
    queryKey: ['platform-onboarding-funnel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_onboarding_funnel')
        .select('*');
      if (error) throw error;
      return data as FunnelStage[];
    },
  });

  const stuckTenantsQuery = useQuery({
    queryKey: ['platform-stuck-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_tenant_health')
        .select('*')
        .eq('is_stuck', true)
        .order('days_inactive', { ascending: false });
      if (error) throw error;
      return data as TenantHealth[];
    },
  });

  return {
    tenantHealth: tenantHealthQuery.data ?? [],
    funnel: funnelQuery.data ?? [],
    stuckTenants: stuckTenantsQuery.data ?? [],
    isLoading: tenantHealthQuery.isLoading || funnelQuery.isLoading,
  };
}
