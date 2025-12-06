import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DynamicPricing, AvailabilityBlock, ExternalCalendar } from '@/types/booking';

// Reservations - Updated to use property_reservations table
export const useReservations = (propertyId?: string, status?: string) => {
  return useQuery({
    queryKey: ['property-reservations', propertyId, status],
    queryFn: async () => {
      let query = supabase.from('property_reservations').select('*');
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      if (status) {
        query = query.eq('booking_status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservation: any) => {
      const { data, error } = await supabase
        .from('property_reservations')
        .insert(reservation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-reservations'] });
    }
  });
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('property_reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-reservations'] });
    }
  });
};

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reservationId: string) => {
      // First delete associated availability block
      const { error: blockError } = await supabase
        .from('availability_blocks')
        .delete()
        .eq('external_booking_id', reservationId);
      
      if (blockError) {
        console.error('Error deleting availability block:', blockError);
      }
      
      // Then delete the reservation
      const { error } = await supabase
        .from('property_reservations')
        .delete()
        .eq('id', reservationId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['bookings-management'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    }
  });
};

// Dynamic Pricing
export const useDynamicPricing = (propertyId: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['dynamic-pricing', propertyId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('dynamic_pricing')
        .select('*')
        .eq('property_id', propertyId);
      
      if (dateRange) {
        query = query
          .gte('date', dateRange.start)
          .lte('date', dateRange.end);
      }
      
      query = query.order('date', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as DynamicPricing[];
    }
  });
};

export const useUpdatePricing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pricing: any) => {
      const { data, error } = await supabase
        .from('dynamic_pricing')
        .upsert(pricing, { onConflict: 'property_id,date' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pricing'] });
    }
  });
};

// Availability
export const useAvailability = (propertyId: string, dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: ['availability', propertyId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('availability_blocks')
        .select('*')
        .eq('property_id', propertyId);
      
      if (dateRange) {
        query = query
          .gte('start_date', dateRange.start)
          .lte('end_date', dateRange.end);
      }
      
      query = query.order('start_date', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as AvailabilityBlock[];
    }
  });
};

export const useCreateAvailabilityBlock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (block: any) => {
      const { data, error } = await supabase
        .from('availability_blocks')
        .insert(block)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    }
  });
};

// External Calendars
export const useExternalCalendars = (propertyId?: string) => {
  return useQuery({
    queryKey: ['external-calendars', propertyId],
    queryFn: async () => {
      let query = supabase.from('external_calendars').select('*');
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ExternalCalendar[];
    }
  });
};

// Sync functions - use sync-pricelabs-pricing edge function
export const useSyncPriceLabs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params?: { property_id?: string }) => {
      const { data, error } = await supabase.functions.invoke('sync-pricelabs-pricing', {
        body: params || {}
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pricing'] });
    }
  });
};

export const useProcessWebhook = () => {
  return useMutation({
    mutationFn: async ({ platform, eventType, data }: { 
      platform: string; 
      eventType: string; 
      data: any; 
    }) => {
      const { data: result, error } = await supabase.functions.invoke('booking-webhook', {
        body: {
          platform,
          event_type: eventType,
          data
        }
      });
      
      if (error) throw error;
      return result;
    }
  });
};