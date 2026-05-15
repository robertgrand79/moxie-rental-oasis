import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export type AiSurface =
  | 'public_guest_chat'
  | 'guest_inbox_reply'
  | 'admin_assistant'
  | 'admin_content_gen';

export const SURFACE_LABELS: Record<AiSurface, string> = {
  public_guest_chat: 'Guest chat widget',
  guest_inbox_reply: 'Guest inbox replies',
  admin_assistant: 'Admin assistant',
  admin_content_gen: 'Content generation',
};

export interface SurfaceUsage {
  surface: AiSurface;
  label: string;
  monthAllowed: number;
  monthBlocked: number;
  rpmLimit: number;
  rpdLimit: number;
  daily14: { day: string; count: number }[];
}

export interface AiUsageData {
  monthStartIso: string;
  monthAllowedTotal: number;
  monthBlockedTotal: number;
  perSurface: SurfaceUsage[];
}

const SURFACES: AiSurface[] = [
  'public_guest_chat',
  'guest_inbox_reply',
  'admin_assistant',
  'admin_content_gen',
];

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildDaily14(rows: { created_at: string }[]): { day: string; count: number }[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    buckets.set(isoDay(d), 0);
  }
  for (const r of rows) {
    const day = r.created_at.slice(0, 10);
    if (buckets.has(day)) {
      buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
  }
  return Array.from(buckets, ([day, count]) => ({ day, count }));
}

export function useAiUsage() {
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const [data, setData] = useState<AiUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orgLoading) return;
    if (!organization?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const monthStartIso = startOfMonthIso();
      const fourteenDaysAgoIso = (() => {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - 13);
        d.setUTCHours(0, 0, 0, 0);
        return d.toISOString();
      })();

      const [defaultsRes, overridesRes, monthRes, dailyRes] = await Promise.all([
        supabase.from('ai_rate_limit_defaults').select('surface, rpm, rpd'),
        supabase
          .from('ai_rate_limit_overrides')
          .select('surface, rpm, rpd')
          .eq('organization_id', organization.id),
        supabase
          .from('ai_request_log')
          .select('surface, was_allowed')
          .eq('organization_id', organization.id)
          .gte('created_at', monthStartIso),
        supabase
          .from('ai_request_log')
          .select('surface, created_at')
          .eq('organization_id', organization.id)
          .eq('was_allowed', true)
          .gte('created_at', fourteenDaysAgoIso),
      ]);

      if (cancelled) return;

      const firstError =
        defaultsRes.error ?? overridesRes.error ?? monthRes.error ?? dailyRes.error;
      if (firstError) {
        setError(firstError.message);
        setLoading(false);
        return;
      }

      const defaultsBySurface = new Map(
        (defaultsRes.data ?? []).map(d => [d.surface, { rpm: d.rpm, rpd: d.rpd }]),
      );
      const overridesBySurface = new Map(
        (overridesRes.data ?? []).map(o => [o.surface, { rpm: o.rpm, rpd: o.rpd }]),
      );

      const perSurface: SurfaceUsage[] = SURFACES.map(surface => {
        const def = defaultsBySurface.get(surface) ?? { rpm: 0, rpd: 0 };
        const over = overridesBySurface.get(surface);
        const rpmLimit = over?.rpm ?? def.rpm;
        const rpdLimit = over?.rpd ?? def.rpd;

        const monthRows = (monthRes.data ?? []).filter(r => r.surface === surface);
        const monthAllowed = monthRows.filter(r => r.was_allowed).length;
        const monthBlocked = monthRows.length - monthAllowed;

        const dailyRows = (dailyRes.data ?? []).filter(r => r.surface === surface);
        const daily14 = buildDaily14(dailyRows);

        return {
          surface,
          label: SURFACE_LABELS[surface],
          monthAllowed,
          monthBlocked,
          rpmLimit,
          rpdLimit,
          daily14,
        };
      });

      const monthAllowedTotal = perSurface.reduce((s, p) => s + p.monthAllowed, 0);
      const monthBlockedTotal = perSurface.reduce((s, p) => s + p.monthBlocked, 0);

      setData({ monthStartIso, monthAllowedTotal, monthBlockedTotal, perSurface });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [orgLoading, organization?.id]);

  return { data, loading: loading || orgLoading, error };
}
