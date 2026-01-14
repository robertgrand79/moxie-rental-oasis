import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface RateLimitResult {
  allowed: boolean;
  tier: string;
  daily_limit: number;
  daily_used: number;
  daily_remaining: number;
  per_minute_limit: number;
  per_minute_used: number;
  reset_daily: number;
  reset_minute: number;
}

export interface RateLimitError {
  error: string;
  type: 'daily_limit' | 'per_minute_limit';
  tier: string;
  daily_used: number;
  daily_limit: number;
  upgrade_available: boolean;
}

/**
 * Check AI rate limit for an organization
 * Returns the rate limit result or throws an error with details
 */
export async function checkAIRateLimit(
  supabase: ReturnType<typeof createClient>,
  organizationId: string,
  operationType: string = 'chat'
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc('check_ai_rate_limit', {
    p_organization_id: organizationId,
    p_operation_type: operationType
  });

  if (error) {
    console.error('Rate limit check failed:', error);
    throw new Error('Failed to check rate limit');
  }

  return data as RateLimitResult;
}

/**
 * Build a rate limit error response
 */
export function buildRateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  const isMinuteLimit = result.per_minute_used >= result.per_minute_limit;
  const upgradeAvailable = result.tier !== 'portfolio';

  const errorBody: RateLimitError = {
    error: isMinuteLimit
      ? 'Too many requests. Please wait a moment before trying again.'
      : `Daily AI limit reached (${result.daily_used}/${result.daily_limit}). ${upgradeAvailable ? 'Upgrade your plan for more.' : 'Limit resets in 24 hours.'}`,
    type: isMinuteLimit ? 'per_minute_limit' : 'daily_limit',
    tier: result.tier,
    daily_used: result.daily_used,
    daily_limit: result.daily_limit,
    upgrade_available: upgradeAvailable
  };

  return new Response(JSON.stringify(errorBody), {
    status: 429,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

/**
 * Get current AI usage stats for an organization (for display purposes)
 */
export async function getAIUsageStats(
  supabase: ReturnType<typeof createClient>,
  organizationId: string
): Promise<{
  tier: string;
  daily_limit: number;
  daily_used: number;
  daily_remaining: number;
  per_minute_limit: number;
  usage_percentage: number;
}> {
  const { data, error } = await supabase.rpc('get_ai_usage_stats', {
    p_organization_id: organizationId
  });

  if (error) {
    console.error('Failed to get AI usage stats:', error);
    throw new Error('Failed to get usage stats');
  }

  return data;
}
