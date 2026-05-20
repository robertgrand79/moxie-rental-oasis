import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export type AiSurface =
  | "public_guest_chat"
  | "guest_inbox_reply"
  | "admin_assistant"
  | "admin_content_gen";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  reason: string | null;
}

let cachedClient: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — rate-limit gate cannot run");
  }
  cachedClient = createClient(url, key, { auth: { persistSession: false } });
  return cachedClient;
}

/**
 * Atomically checks an org's per-surface rate limit AND logs the attempt.
 *
 * Always log every call (allowed or blocked) for visibility and billing.
 * Edge functions should call this BEFORE invoking the model.
 *
 * If organizationId is null/missing, this is treated as a hard block — we
 * never want to bill an unknown tenant or let unscoped requests through.
 *
 * When clientKey is supplied (e.g. a hashed IP), a per-client cap is enforced
 * before the per-org cap so one abusive client cannot exhaust the org quota.
 */
export async function checkAiRateLimit(
  organizationId: string | null | undefined,
  surface: AiSurface,
  clientKey?: string | null,
): Promise<RateLimitResult> {
  if (!organizationId) {
    return { allowed: false, retryAfterSeconds: 0, reason: "missing_organization_id" };
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase.rpc("check_and_log_ai_request", {
    p_organization_id: organizationId,
    p_surface: surface,
    p_client_key: clientKey ?? null,
  });

  if (error) {
    // Fail OPEN: if the rate-limit DB is unreachable, don't take down the user-facing AI flow.
    // We log to console so it shows up in edge function logs.
    console.error("[aiRateLimit] RPC failed, failing open:", error.message);
    return { allowed: true, retryAfterSeconds: 0, reason: "rate_limit_check_failed" };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.error("[aiRateLimit] RPC returned no row, failing open");
    return { allowed: true, retryAfterSeconds: 0, reason: "rate_limit_no_result" };
  }

  return {
    allowed: Boolean(row.allowed),
    retryAfterSeconds: Number(row.retry_after_seconds ?? 0),
    reason: row.reason ?? null,
  };
}

/**
 * Resolve an organization_id from the request's Authorization header.
 *
 * Used by authenticated edge functions where the frontend doesn't explicitly pass
 * organizationId. We never trust a body-supplied org_id from these surfaces because
 * the user could swap in a different tenant's id to exhaust their quota.
 *
 * Picks the user's first organization_members row (most users only belong to one
 * org). Returns null on any failure so the caller can decide policy.
 */
export async function organizationIdFromAuth(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) return null;

  const userClient = createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: { Authorization: auth } },
  });

  const { data: userRes, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userRes?.user) return null;

  const { data: member } = await getServiceClient()
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userRes.user.id)
    .limit(1)
    .maybeSingle();

  return (member as { organization_id?: string } | null)?.organization_id ?? null;
}

/**
 * Build a 429 Response when checkAiRateLimit returns allowed=false.
 * Caller is responsible for the CORS headers it wants merged in.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  extraHeaders: Record<string, string> = {},
): Response {
  const retryAfter = Math.max(1, result.retryAfterSeconds || 60);
  return new Response(
    JSON.stringify({
      error: "rate_limited",
      message:
        result.reason?.includes("day_limit")
          ? "Daily AI usage limit reached. Please try again tomorrow or contact support."
          : "AI request limit reached. Please slow down and try again in a moment.",
      retry_after_seconds: retryAfter,
      reason: result.reason,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        ...extraHeaders,
      },
    },
  );
}
