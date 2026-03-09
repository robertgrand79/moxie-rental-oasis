import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { debug } from '@/utils/debug';
import { acquireTenantSettingsChannel } from '@/hooks/tenantSettingsRealtime';
import { defaultTenantSettings } from '@/hooks/settings/defaultTenantSettings';

interface TenantSettings {
  [key: string]: string | undefined;
}

/**
 * Hook to fetch site settings for the current tenant.
 * Implements a "Soft-Patch" pattern:
 *  1. Deeply merges DB rows OVER defaultTenantSettings so missing keys fall back safely.
 *  2. Fires a silent background syncMissingSettings mutation when the DB has fewer keys
 *     than the defaults, upserting the missing rows.
 */
export const useTenantSettings = () => {
  const { tenantId, tenant, loading: tenantLoading } = useTenant();
  const queryClient = useQueryClient();
  const syncFiredRef = useRef<string | null>(null);

  // ── Fetch ────────────────────────────────────────────
  const query = useQuery({
    queryKey: ['tenant-settings', tenantId],
    queryFn: async (): Promise<TenantSettings> => {
      if (!tenantId) {
        debug.settings('No tenantId, returning empty settings');
        return {};
      }

      debug.settings('Fetching settings for org:', tenantId, tenant?.name);

      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', tenantId);

      if (error) {
        debug.error('[TenantSettings] Error:', error.message);
        throw error;
      }

      const settings: TenantSettings = {};
      if (data) {
        data.forEach((row) => {
          settings[row.key] = row.value as string;
        });
      }

      debug.settings('Loaded', data?.length ?? 0, 'settings');
      return settings;
    },
    enabled: !!tenantId && !tenantLoading,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // ── Soft-Patch: merge defaults under DB values ───────
  const dbSettings = query.data ?? {};
  const mergedSettings: TenantSettings = {
    ...defaultTenantSettings,
    ...dbSettings,
    // Resolve logo & site_name with tenant-level fallbacks
    logo_url: dbSettings.siteLogo || dbSettings.logo_url || dbSettings.logoUrl || tenant?.logo_url || defaultTenantSettings.logo_url,
    site_name: dbSettings.site_name || dbSettings.siteName || tenant?.name || defaultTenantSettings.site_name,
  };

  debug.settings('Logo resolved:', mergedSettings.logo_url ? 'Found' : 'Not configured');

  // ── Silent sync of missing keys ──────────────────────
  const syncMutation = useMutation({
    mutationFn: async (missingKeys: string[]) => {
      if (!tenantId || missingKeys.length === 0) return;

      debug.settings(`[SoftPatch] Syncing ${missingKeys.length} missing keys for`, tenantId);

      const rows = missingKeys.map((key) => ({
        organization_id: tenantId,
        key,
        value: defaultTenantSettings[key] ?? '',
      }));

      const { error } = await supabase
        .from('site_settings')
        .upsert(rows, { onConflict: 'organization_id,key', ignoreDuplicates: true });

      if (error) {
        debug.error('[SoftPatch] Upsert error:', error.message);
      }
    },
    onSuccess: () => {
      // Silently refresh cache so counts stay up to date next time
      queryClient.invalidateQueries({ queryKey: ['tenant-settings', tenantId] });
    },
  });

  useEffect(() => {
    if (!tenantId || query.isLoading || !query.data) return;

    const dbKeys = new Set(Object.keys(query.data));
    const missingKeys = Object.keys(defaultTenantSettings).filter((k) => !dbKeys.has(k));

    // Only fire once per tenant per session
    if (missingKeys.length > 0 && syncFiredRef.current !== tenantId) {
      syncFiredRef.current = tenantId;
      syncMutation.mutate(missingKeys);
    }
  }, [tenantId, query.isLoading, query.data]);

  // ── Realtime subscription ────────────────────────────
  const channelAcquiredRef = useRef(false);
  const currentTenantRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    if (channelAcquiredRef.current && currentTenantRef.current === tenantId) return;

    channelAcquiredRef.current = true;
    currentTenantRef.current = tenantId;

    const release = acquireTenantSettingsChannel(tenantId, queryClient);

    return () => {
      channelAcquiredRef.current = false;
      currentTenantRef.current = null;
      release();
    };
  }, [tenantId, queryClient]);

  return {
    settings: mergedSettings,
    loading: tenantLoading || query.isLoading,
    error: query.error?.message ?? null,
  };
};
