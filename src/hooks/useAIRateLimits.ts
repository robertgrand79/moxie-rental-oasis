import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Json } from '@/integrations/supabase/types';

export interface AIUsageStats {
  tier: string;
  daily_limit: number;
  daily_used: number;
  daily_remaining: number;
  per_minute_limit: number;
  usage_percentage: number;
}

export interface AIRateLimitError {
  error: string;
  type: 'daily_limit' | 'per_minute_limit';
  tier: string;
  daily_used: number;
  daily_limit: number;
  upgrade_available: boolean;
}

function parseUsageStats(data: Json): AIUsageStats {
  const obj = data as Record<string, unknown>;
  return {
    tier: String(obj.tier || 'starter'),
    daily_limit: Number(obj.daily_limit || 100),
    daily_used: Number(obj.daily_used || 0),
    daily_remaining: Number(obj.daily_remaining || 100),
    per_minute_limit: Number(obj.per_minute_limit || 5),
    usage_percentage: Number(obj.usage_percentage || 0),
  };
}

export function useAIRateLimits() {
  const { organization } = useCurrentOrganization();

  const { data: usageStats, isLoading, error, refetch } = useQuery({
    queryKey: ['ai-usage-stats', organization?.id],
    queryFn: async (): Promise<AIUsageStats | null> => {
      if (!organization?.id) return null;

      const { data, error } = await supabase.rpc('get_ai_usage_stats', {
        p_organization_id: organization.id
      });

      if (error) {
        console.error('Failed to fetch AI usage stats:', error);
        throw error;
      }

      return data ? parseUsageStats(data) : null;
    },
    enabled: !!organization?.id,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  const isNearLimit = usageStats ? usageStats.usage_percentage >= 80 : false;
  const isAtLimit = usageStats ? usageStats.daily_remaining <= 0 : false;
  const canUpgrade = usageStats ? usageStats.tier !== 'portfolio' : false;

  const tierDisplayName = usageStats?.tier 
    ? usageStats.tier.charAt(0).toUpperCase() + usageStats.tier.slice(1)
    : 'Unknown';

  const nextTier = usageStats?.tier === 'starter' 
    ? 'Professional' 
    : usageStats?.tier === 'professional' 
      ? 'Portfolio' 
      : null;

  return {
    usageStats,
    isLoading,
    error,
    refetch,
    isNearLimit,
    isAtLimit,
    canUpgrade,
    tierDisplayName,
    nextTier,
  };
}

/**
 * Parse a rate limit error from an AI API response
 */
export function parseAIRateLimitError(error: any): AIRateLimitError | null {
  if (error?.type === 'daily_limit' || error?.type === 'per_minute_limit') {
    return error as AIRateLimitError;
  }
  
  // Check if it's wrapped in a response
  if (error?.error && (error.type === 'daily_limit' || error.type === 'per_minute_limit')) {
    return error as AIRateLimitError;
  }

  return null;
}
