import type { QueryClient } from '@tanstack/react-query';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { debug } from '@/utils/debug';

type TenantChannelEntry = {
  channel: RealtimeChannel;
  refCount: number;
  channelName: string;
};

const tenantSettingsChannels = new Map<string, TenantChannelEntry>();
let channelCounter = 0;

export const acquireTenantSettingsChannel = (tenantId: string, queryClient: QueryClient) => {
  const key = tenantId;
  const existing = tenantSettingsChannels.get(key);

  if (existing) {
    existing.refCount += 1;
    debug.settings('Reusing tenant settings channel, refCount:', existing.refCount);
    return () => {
      existing.refCount -= 1;
      if (existing.refCount <= 0) {
        try {
          supabase.removeChannel(existing.channel);
        } catch (e) {
          // Ignore cleanup errors
        }
        tenantSettingsChannels.delete(key);
      }
    };
  }

  // Use unique channel name with counter to avoid duplicate subscription errors
  channelCounter += 1;
  const channelName = `tenant_settings_${tenantId}_${channelCounter}`;

  let channel: RealtimeChannel;
  try {
    channel = supabase
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
          debug.settings('Tenant settings channel subscribed:', channelName);
        }
      });
  } catch (error) {
    debug.error('Failed to create tenant settings channel:', error);
    // Return no-op cleanup if channel creation fails
    return () => {};
  }

  const entry: TenantChannelEntry = { channel, refCount: 1, channelName };
  tenantSettingsChannels.set(key, entry);

  return () => {
    entry.refCount -= 1;
    if (entry.refCount <= 0) {
      try {
        supabase.removeChannel(entry.channel);
      } catch (e) {
        // Ignore cleanup errors
      }
      tenantSettingsChannels.delete(key);
    }
  };
};
