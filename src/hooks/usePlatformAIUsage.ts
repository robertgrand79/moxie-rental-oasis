import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TenantAIUsage {
  organization_id: string;
  organization_name: string;
  subscription_tier: string;
  daily_used: number;
  daily_limit: number;
  usage_percentage: number;
  total_requests_30d: number;
  total_tokens_30d: number;
  has_override: boolean;
  override_limit: number | null;
}

export interface AIUsageTrend {
  date: string;
  total_requests: number;
  unique_tenants: number;
}

export interface TierLimits {
  starter: number;
  professional: number;
  portfolio: number;
}

export interface AbusePattern {
  organization_id: string;
  organization_name: string;
  pattern_type: 'high_frequency' | 'unusual_spike' | 'approaching_limit';
  description: string;
  severity: 'low' | 'medium' | 'high';
  detected_at: string;
}

const TIER_LIMITS: TierLimits = {
  starter: 100,
  professional: 500,
  portfolio: 2000,
};

export const usePlatformAIUsage = () => {
  const queryClient = useQueryClient();

  // Fetch AI usage across all tenants
  const { data: tenantUsage, isLoading: loadingTenantUsage } = useQuery({
    queryKey: ['platform-ai-tenant-usage'],
    queryFn: async (): Promise<TenantAIUsage[]> => {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get all active organizations with their usage
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name, subscription_tier')
        .eq('is_active', true)
        .eq('is_template', false);

      if (orgsError) throw orgsError;

      // Get today's usage for each org
      const { data: dailyUsage, error: dailyError } = await supabase
        .from('ai_usage')
        .select('organization_id, request_count')
        .gte('window_start', today);

      if (dailyError) throw dailyError;

      // Get 30-day totals
      const { data: monthlyUsage, error: monthlyError } = await supabase
        .from('ai_usage')
        .select('organization_id, request_count, tokens_used')
        .gte('window_start', thirtyDaysAgo);

      if (monthlyError) throw monthlyError;

      // Get any overrides
      const { data: overrides, error: overridesError } = await supabase
        .from('ai_usage_overrides')
        .select('organization_id, daily_limit');

      // Aggregate data
      const dailyByOrg = new Map<string, number>();
      dailyUsage?.forEach(u => {
        dailyByOrg.set(u.organization_id, (dailyByOrg.get(u.organization_id) || 0) + u.request_count);
      });

      const monthlyByOrg = new Map<string, { requests: number; tokens: number }>();
      monthlyUsage?.forEach(u => {
        const current = monthlyByOrg.get(u.organization_id) || { requests: 0, tokens: 0 };
        monthlyByOrg.set(u.organization_id, {
          requests: current.requests + u.request_count,
          tokens: current.tokens + (u.tokens_used || 0),
        });
      });

      const overridesByOrg = new Map<string, number>();
      overrides?.forEach(o => {
        overridesByOrg.set(o.organization_id, o.daily_limit);
      });

      return (orgs || []).map(org => {
        const tier = (org.subscription_tier || 'starter') as keyof TierLimits;
        const baseLimit = TIER_LIMITS[tier] || TIER_LIMITS.starter;
        const override = overridesByOrg.get(org.id);
        const dailyLimit = override ?? baseLimit;
        const dailyUsed = dailyByOrg.get(org.id) || 0;
        const monthly = monthlyByOrg.get(org.id) || { requests: 0, tokens: 0 };

        return {
          organization_id: org.id,
          organization_name: org.name,
          subscription_tier: org.subscription_tier || 'starter',
          daily_used: dailyUsed,
          daily_limit: dailyLimit,
          usage_percentage: dailyLimit > 0 ? Math.round((dailyUsed / dailyLimit) * 100) : 0,
          total_requests_30d: monthly.requests,
          total_tokens_30d: monthly.tokens,
          has_override: override !== undefined,
          override_limit: override ?? null,
        };
      }).sort((a, b) => b.usage_percentage - a.usage_percentage);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch platform-wide usage trends
  const { data: usageTrends, isLoading: loadingTrends } = useQuery({
    queryKey: ['platform-ai-usage-trends'],
    queryFn: async (): Promise<AIUsageTrend[]> => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('ai_usage')
        .select('window_start, request_count, organization_id')
        .gte('window_start', thirtyDaysAgo)
        .order('window_start', { ascending: true });

      if (error) throw error;

      // Aggregate by date
      const byDate = new Map<string, { requests: number; orgs: Set<string> }>();
      data?.forEach(u => {
        const date = u.window_start.split('T')[0];
        const current = byDate.get(date) || { requests: 0, orgs: new Set<string>() };
        current.requests += u.request_count;
        current.orgs.add(u.organization_id);
        byDate.set(date, current);
      });

      return Array.from(byDate.entries()).map(([date, stats]) => ({
        date,
        total_requests: stats.requests,
        unique_tenants: stats.orgs.size,
      }));
    },
  });

  // Detect abuse patterns
  const { data: abusePatterns, isLoading: loadingAbuse } = useQuery({
    queryKey: ['platform-ai-abuse-patterns'],
    queryFn: async (): Promise<AbusePattern[]> => {
      const patterns: AbusePattern[] = [];
      const now = new Date();

      if (!tenantUsage) return patterns;

      tenantUsage.forEach(tenant => {
        // High usage (>80% of limit)
        if (tenant.usage_percentage >= 80) {
          patterns.push({
            organization_id: tenant.organization_id,
            organization_name: tenant.organization_name,
            pattern_type: 'approaching_limit',
            description: `Using ${tenant.usage_percentage}% of daily limit (${tenant.daily_used}/${tenant.daily_limit})`,
            severity: tenant.usage_percentage >= 95 ? 'high' : 'medium',
            detected_at: now.toISOString(),
          });
        }

        // Very high 30-day usage relative to tier
        const expectedMonthly = tenant.daily_limit * 30;
        if (tenant.total_requests_30d > expectedMonthly * 0.8) {
          patterns.push({
            organization_id: tenant.organization_id,
            organization_name: tenant.organization_name,
            pattern_type: 'high_frequency',
            description: `${tenant.total_requests_30d} requests in 30 days (${Math.round((tenant.total_requests_30d / expectedMonthly) * 100)}% of expected max)`,
            severity: tenant.total_requests_30d > expectedMonthly ? 'high' : 'medium',
            detected_at: now.toISOString(),
          });
        }
      });

      return patterns.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
    },
    enabled: !!tenantUsage,
  });

  // Set override limit for an organization
  const setOverrideMutation = useMutation({
    mutationFn: async ({ organizationId, dailyLimit }: { organizationId: string; dailyLimit: number | null }) => {
      if (dailyLimit === null) {
        // Remove override
        const { error } = await supabase
          .from('ai_usage_overrides')
          .delete()
          .eq('organization_id', organizationId);
        if (error) throw error;
      } else {
        // Upsert override
        const { error } = await supabase
          .from('ai_usage_overrides')
          .upsert({
            organization_id: organizationId,
            daily_limit: dailyLimit,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'organization_id' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-ai-tenant-usage'] });
      toast.success('AI limit override updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update override: ${error.message}`);
    },
  });

  // Platform-wide metrics
  const platformMetrics = tenantUsage ? {
    totalRequests24h: tenantUsage.reduce((sum, t) => sum + t.daily_used, 0),
    totalRequests30d: tenantUsage.reduce((sum, t) => sum + t.total_requests_30d, 0),
    activeTenants: tenantUsage.filter(t => t.daily_used > 0).length,
    tenantsAtLimit: tenantUsage.filter(t => t.usage_percentage >= 100).length,
    tenantsApproachingLimit: tenantUsage.filter(t => t.usage_percentage >= 80 && t.usage_percentage < 100).length,
  } : null;

  return {
    tenantUsage,
    loadingTenantUsage,
    usageTrends,
    loadingTrends,
    abusePatterns,
    loadingAbuse,
    platformMetrics,
    tierLimits: TIER_LIMITS,
    setOverride: setOverrideMutation.mutate,
    isSettingOverride: setOverrideMutation.isPending,
  };
};
