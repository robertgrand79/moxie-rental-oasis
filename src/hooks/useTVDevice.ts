import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TVDeviceStatus {
  id: string;
  device_id: string;
  property_id: string;
  is_paired: boolean;
  display_mode: 'welcome' | 'guest_portal' | 'signage';
  pairing_code: string | null;
  pairing_code_expires_at: string | null;
  guest_email: string | null;
  paired_at: string | null;
  last_seen_at: string | null;
  property?: {
    id: string;
    title: string;
    location: string | null;
    organization_id: string;
  };
}

export interface TVDeviceRegistration {
  property_id: string;
  device_name?: string;
}

/**
 * useTVDevice - Hook for TV device management
 * 
 * Features:
 * - Device registration with property
 * - Pairing code generation
 * - Status polling with real-time subscription
 * - Automatic navigation on pairing
 */
export const useTVDevice = (propertyId: string | undefined) => {
  const queryClient = useQueryClient();
  const [localDeviceId, setLocalDeviceId] = useState<string | null>(null);

  // Get or create persistent device ID
  useEffect(() => {
    let deviceId = localStorage.getItem('tv_device_id');
    if (!deviceId) {
      deviceId = `tv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('tv_device_id', deviceId);
    }
    setLocalDeviceId(deviceId);
  }, []);

  // Fetch device status
  const {
    data: device,
    isLoading,
    error,
    refetch,
  } = useQuery<TVDeviceStatus | null>({
    queryKey: ['tv-device', propertyId, localDeviceId],
    queryFn: async () => {
      if (!propertyId || !localDeviceId) return null;

      const { data, error } = await supabase
        .from('tv_device_pairings')
        .select(`
          id,
          device_id,
          property_id,
          is_paired,
          display_mode,
          pairing_code,
          pairing_code_expires_at,
          guest_email,
          paired_at,
          last_seen_at,
          properties(id, title, location, organization_id)
        `)
        .eq('device_id', localDeviceId)
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          property: data.properties as TVDeviceStatus['property'],
        } as TVDeviceStatus;
      }
      return null;
    },
    enabled: !!propertyId && !!localDeviceId,
    refetchInterval: 5000, // Poll every 5 seconds for pairing status
  });

  // Register device mutation
  const registerDevice = useMutation({
    mutationFn: async (registration: TVDeviceRegistration) => {
      if (!localDeviceId) throw new Error('Device ID not initialized');

      const { data, error } = await supabase.functions.invoke('tv-device-register', {
        body: {
          property_id: registration.property_id,
          device_id: localDeviceId,
          device_name: registration.device_name || 'TV Device',
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Registration failed');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-device', propertyId, localDeviceId] });
    },
  });

  // Regenerate pairing code mutation
  const regeneratePairingCode = useMutation({
    mutationFn: async () => {
      if (!device?.id) throw new Error('Device not registered');

      const newCode = Math.random().toString().slice(2, 8);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('tv_device_pairings')
        .update({
          pairing_code: newCode,
          pairing_code_expires_at: expiresAt,
          is_paired: false,
          guest_email: null,
        })
        .eq('id', device.id);

      if (error) throw error;
      return { pairing_code: newCode, expires_at: expiresAt };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-device', propertyId, localDeviceId] });
    },
  });

  // Unpair device mutation
  const unpairDevice = useMutation({
    mutationFn: async () => {
      if (!device?.id) throw new Error('Device not registered');

      const { data, error } = await supabase.functions.invoke('tv-device-unpair', {
        body: { device_id: device.device_id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tv-device', propertyId, localDeviceId] });
    },
  });

  // Real-time subscription for pairing updates
  useEffect(() => {
    if (!device?.id) return;

    const channel = supabase
      .channel(`tv_device_${device.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tv_device_pairings',
          filter: `id=eq.${device.id}`,
        },
        (payload) => {
          console.log('TV device update:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['tv-device', propertyId, localDeviceId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [device?.id, propertyId, localDeviceId, queryClient]);

  // Update last seen periodically
  useEffect(() => {
    if (!device?.id) return;

    const updateLastSeen = async () => {
      await supabase
        .from('tv_device_pairings')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', device.id);
    };

    const interval = setInterval(updateLastSeen, 60000); // Every minute
    return () => clearInterval(interval);
  }, [device?.id]);

  // Check if pairing code is expired
  const isPairingCodeExpired = useCallback(() => {
    if (!device?.pairing_code_expires_at) return true;
    return new Date(device.pairing_code_expires_at) < new Date();
  }, [device?.pairing_code_expires_at]);

  // Generate QR code URL
  const getQRCodeUrl = useCallback((baseUrl: string) => {
    if (!device?.pairing_code || !propertyId) return null;
    const pairUrl = `${baseUrl}/pair-tv?code=${device.pairing_code}&property=${propertyId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pairUrl)}`;
  }, [device?.pairing_code, propertyId]);

  return {
    device,
    localDeviceId,
    isLoading,
    error,
    isPaired: device?.is_paired ?? false,
    displayMode: device?.display_mode ?? 'welcome',
    pairingCode: device?.pairing_code,
    isPairingCodeExpired,
    getQRCodeUrl,
    registerDevice,
    regeneratePairingCode,
    unpairDevice,
    refetch,
  };
};

export default useTVDevice;
