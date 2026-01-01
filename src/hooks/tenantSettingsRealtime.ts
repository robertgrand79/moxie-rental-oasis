import type { QueryClient } from '@tanstack/react-query';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { debug } from '@/utils/debug';

type TenantChannelEntry = {
  channel: RealtimeChannel;
  refCount: number;
};

const tenantSettingsChannels = new Map<string, TenantChannelEntry>();

export const acquireTenantSettingsChannel = (tenantId: string, queryClient: QueryClient) => {
  const key = tenantId;
  const existing = tenantSettingsChannels.get(key);

  if (existing) {
    existing.refCount += 1;
    return () => {
      existing.refCount -= 1;
      if (existing.refCount <= 0) {
        supabase.removeChannel(existing.channel);
        tenantSettingsChannels.delete(key);
      }
    };
  }

  const channelName = `tenant_settings_${tenantId}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'site_settings',
        filter: `organization_id=eq.${tenantId}`,
      },
      (payload) => {
        debug.settings('Tenant settings realtime update:', payload.eventType);
        queryClient.invalidateQueries({ queryKey: ['tenant-settings', tenantId] });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        debug.settings('Tenant settings channel subscribed');
      }
    });

  const entry: TenantChannelEntry = { channel, refCount: 1 };
  tenantSettingsChannels.set(key, entry);

  return () => {
    entry.refCount -= 1;
    if (entry.refCount <= 0) {
      supabase.removeChannel(entry.channel);
      tenantSettingsChannels.delete(key);
    }
  };
};
