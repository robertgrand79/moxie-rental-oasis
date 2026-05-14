import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilityParams {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
}

interface PropertiesAvailabilityResult {
  availableProperties: Array<{ id: string; title: string }>;
  unavailablePropertyIds: string[];
}

type BlockedRange = { property_id: string; blocked_start: string; blocked_end: string };

export const useAvailabilitySearch = (params: AvailabilityParams, enabled: boolean = true) => {
  return useQuery<{ isAvailable: boolean; conflicts: BlockedRange[] }>({
    queryKey: ['property-availability', params.propertyId, params.checkInDate, params.checkOutDate],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_blocked_dates', {
        p_property_ids: [params.propertyId],
        p_start_date: params.checkInDate,
        p_end_date: params.checkOutDate,
      });

      if (error) throw error;
      const conflicts = (data ?? []) as BlockedRange[];
      return { isAvailable: conflicts.length === 0, conflicts };
    },
    enabled: enabled && !!params.propertyId && !!params.checkInDate && !!params.checkOutDate,
    staleTime: 30 * 1000,
  });
};

export const usePropertiesAvailability = (checkInDate: string, checkOutDate: string, enabled = true) => {
  return useQuery<PropertiesAvailabilityResult>({
    queryKey: ['properties-availability', checkInDate, checkOutDate],
    queryFn: async () => {
      const propertiesResponse = await (supabase as any)
        .from('properties')
        .select('id, title');

      if (propertiesResponse.error) throw propertiesResponse.error;
      const properties = (propertiesResponse.data || []) as Array<{ id: string; title: string }>;

      if (properties.length === 0) {
        return { availableProperties: [], unavailablePropertyIds: [] };
      }

      const { data: blockedData, error: blockedError } = await (supabase as any).rpc('get_blocked_dates', {
        p_property_ids: properties.map(p => p.id),
        p_start_date: checkInDate,
        p_end_date: checkOutDate,
      });

      if (blockedError) throw blockedError;

      const unavailableIds = new Set<string>(
        ((blockedData ?? []) as BlockedRange[]).map(b => b.property_id)
      );

      return {
        availableProperties: properties.filter(p => !unavailableIds.has(p.id)),
        unavailablePropertyIds: Array.from(unavailableIds),
      };
    },
    enabled: enabled && !!checkInDate && !!checkOutDate,
    staleTime: 30 * 1000,
  });
};
