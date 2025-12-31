import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TVDeviceAdmin {
  id: string;
  device_id: string;
  device_name: string | null;
  property_id: string;
  is_paired: boolean;
  display_mode: string;
  guest_email: string | null;
  paired_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  property?: {
    id: string;
    title: string;
  };
}

/**
 * useTVDeviceAdmin - Hook for admin TV device management
 * 
 * Features:
 * - List all devices for organization
 * - Filter by property
 * - Device status monitoring
 */
export const useTVDeviceAdmin = (organizationId: string | undefined) => {
  // Fetch all devices for organization
  const {
    data: devices,
    isLoading,
    error,
    refetch,
  } = useQuery<TVDeviceAdmin[]>({
    queryKey: ['tv-devices-admin', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('tv_device_pairings')
        .select(`
          id,
          device_id,
          device_name,
          property_id,
          is_paired,
          display_mode,
          guest_email,
          paired_at,
          last_seen_at,
          created_at,
          properties(id, title)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((d) => ({
        ...d,
        property: d.properties as TVDeviceAdmin['property'],
      })) as TVDeviceAdmin[];
    },
    enabled: !!organizationId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get device counts
  const deviceCounts = {
    total: devices?.length || 0,
    paired: devices?.filter((d) => d.is_paired).length || 0,
    unpaired: devices?.filter((d) => !d.is_paired).length || 0,
    online: devices?.filter((d) => {
      if (!d.last_seen_at) return false;
      const lastSeen = new Date(d.last_seen_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return lastSeen > fiveMinutesAgo;
    }).length || 0,
  };

  // Check if a device is online (seen in last 5 minutes)
  const isDeviceOnline = (device: TVDeviceAdmin) => {
    if (!device.last_seen_at) return false;
    const lastSeen = new Date(device.last_seen_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  };

  return {
    devices,
    deviceCounts,
    isLoading,
    error,
    refetch,
    isDeviceOnline,
  };
};

export default useTVDeviceAdmin;
