import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AvailabilityParams {
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
}

export const useAvailabilitySearch = (params: AvailabilityParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['property-availability', params.propertyId, params.checkInDate, params.checkOutDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_blocks')
        .select('id, start_date, end_date, source_platform')
        .eq('property_id', params.propertyId)
        .eq('block_type', 'booked');

      if (error) throw error;

      const conflicts = (data || []).filter(block => {
        const blockStart = new Date(block.start_date);
        const blockEnd = new Date(block.end_date);
        const checkIn = new Date(params.checkInDate);
        const checkOut = new Date(params.checkOutDate);

        return (
          (blockStart >= checkIn && blockStart < checkOut) ||
          (blockEnd > checkIn && blockEnd <= checkOut) ||
          (blockStart <= checkIn && blockEnd >= checkOut)
        );
      });

      return { isAvailable: conflicts.length === 0, conflicts };
    },
    enabled: enabled && !!params.propertyId && !!params.checkInDate && !!params.checkOutDate,
    staleTime: 30 * 1000,
  });
};

export const usePropertiesAvailability = (checkInDate: string, checkOutDate: string, enabled = true) => {
  return useQuery<{ availableProperties: Array<{ id: string; title: string }>; unavailablePropertyIds: string[] }>({
    queryKey: ['properties-availability', checkInDate, checkOutDate],
    queryFn: async () => {
      const { data: properties, error: propsError } = await supabase
        .from('properties')
        .select('id, title')
        .eq('is_active', true);

      if (propsError) throw propsError;

      const { data: blocks, error: blocksError } = await supabase
        .from('availability_blocks')
        .select('property_id, start_date, end_date')
        .eq('block_type', 'booked');

      if (blocksError) throw blocksError;

      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      const unavailableIds = new Set<string>();
      
      (blocks || []).forEach(block => {
        const blockStart = new Date(block.start_date);
        const blockEnd = new Date(block.end_date);
        if (
          (blockStart >= checkIn && blockStart < checkOut) ||
          (blockEnd > checkIn && blockEnd <= checkOut) ||
          (blockStart <= checkIn && blockEnd >= checkOut)
        ) {
          unavailableIds.add(block.property_id);
        }
      });
      
      return {
        availableProperties: (properties || []).filter(p => !unavailableIds.has(p.id)),
        unavailablePropertyIds: Array.from(unavailableIds),
      };
    },
    enabled: enabled && !!checkInDate && !!checkOutDate,
    staleTime: 30 * 1000,
  });
};
