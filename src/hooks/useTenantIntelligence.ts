import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PlatformEmail } from '@/hooks/usePlatformEmails';

export interface TenantIntelligence {
  // From organizations_safe
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  custom_domain: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  is_active: boolean | null;
  has_stripe_configured: boolean | null;
  has_pricelabs_configured: boolean | null;
  has_seam_configured: boolean | null;
  has_resend_configured: boolean | null;
  has_openphone_configured: boolean | null;
  has_turno_configured: boolean | null;
  // From platform_tenant_health
  health_score: number | null;
  total_bookings: number | null;
  bookings_last_30d: number | null;
  days_inactive: number | null;
  total_conversations: number | null;
  conversations_last_7d: number | null;
  current_stage: string | null;
  is_stuck: boolean | null;
  last_activity_at: string | null;
}

export const useTenantIntelligence = (email: PlatformEmail | null) => {
  const orgId = email?.linked_organization_id;
  const fromAddress = email?.from_address;

  // Strategy 1: Direct org ID from email
  // Strategy 2: Resolve org from sender's email via profiles + org_members
  const { data: resolvedOrgId, isLoading: isResolving } = useQuery({
    queryKey: ['resolve-tenant-org', fromAddress],
    queryFn: async () => {
      if (!fromAddress) return null;
      
      // Look up profile by email, then find their org
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', fromAddress)
        .maybeSingle();
      
      if (!profile) return null;

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', profile.id)
        .limit(1)
        .maybeSingle();
      
      return membership?.organization_id ?? null;
    },
    enabled: !orgId && !!fromAddress,
    staleTime: 10 * 60 * 1000,
  });

  const effectiveOrgId = orgId ?? resolvedOrgId;

  // Fetch org details from organizations_safe
  const { data: orgData, isLoading: isLoadingOrg } = useQuery({
    queryKey: ['tenant-intel-org', effectiveOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations_safe')
        .select('id, name, slug, logo_url, custom_domain, subscription_tier, subscription_status, is_active, has_stripe_configured, has_pricelabs_configured, has_seam_configured, has_resend_configured, has_openphone_configured, has_turno_configured')
        .eq('id', effectiveOrgId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveOrgId,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch health metrics from platform_tenant_health
  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['tenant-intel-health', effectiveOrgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_tenant_health')
        .select('health_score, total_bookings, bookings_last_30d, days_inactive, total_conversations, conversations_last_7d, current_stage, is_stuck, last_activity_at')
        .eq('organization_id', effectiveOrgId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!effectiveOrgId,
    staleTime: 5 * 60 * 1000,
  });

  const tenant: TenantIntelligence | null = orgData ? {
    id: orgData.id!,
    name: orgData.name!,
    slug: orgData.slug!,
    logo_url: orgData.logo_url,
    custom_domain: orgData.custom_domain,
    subscription_tier: orgData.subscription_tier,
    subscription_status: orgData.subscription_status,
    is_active: orgData.is_active,
    has_stripe_configured: orgData.has_stripe_configured,
    has_pricelabs_configured: orgData.has_pricelabs_configured,
    has_seam_configured: orgData.has_seam_configured,
    has_resend_configured: orgData.has_resend_configured,
    has_openphone_configured: orgData.has_openphone_configured,
    has_turno_configured: orgData.has_turno_configured,
    health_score: healthData?.health_score ?? null,
    total_bookings: healthData?.total_bookings ?? null,
    bookings_last_30d: healthData?.bookings_last_30d ?? null,
    days_inactive: healthData?.days_inactive ?? null,
    total_conversations: healthData?.total_conversations ?? null,
    conversations_last_7d: healthData?.conversations_last_7d ?? null,
    current_stage: healthData?.current_stage ?? null,
    is_stuck: healthData?.is_stuck ?? null,
    last_activity_at: healthData?.last_activity_at ?? null,
  } : null;

  return {
    tenant,
    isLoading: isResolving || isLoadingOrg || isLoadingHealth,
    organizationId: effectiveOrgId,
  };
};
