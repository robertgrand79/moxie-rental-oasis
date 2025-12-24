import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PropertyBookingSettings {
  checkInTime: string;
  checkOutTime: string;
  minStay: number;
  maxStay: number;
  instantBook: boolean;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  cancellationDeadlineHours: number;
}

const DEFAULT_SETTINGS: PropertyBookingSettings = {
  checkInTime: '3:00 PM',
  checkOutTime: '11:00 AM',
  minStay: 1,
  maxStay: 365,
  instantBook: true,
  cancellationPolicy: 'flexible',
  cancellationDeadlineHours: 24
};

/**
 * Hook to fetch property-specific booking settings
 * Falls back to organization defaults, then system defaults
 */
export const usePropertyBookingSettings = (propertyId?: string) => {
  return useQuery({
    queryKey: ['property-booking-settings', propertyId],
    queryFn: async (): Promise<PropertyBookingSettings> => {
      if (!propertyId) return DEFAULT_SETTINGS;

      // For now, return default settings
      // In the future, this can be extended to read from property metadata
      // or a dedicated property_settings table
      return DEFAULT_SETTINGS;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!propertyId
  });
};

/**
 * Get cancellation policy details
 */
export const getCancellationPolicyDetails = (policy: PropertyBookingSettings['cancellationPolicy']) => {
  const policies = {
    flexible: {
      name: 'Flexible',
      description: 'Free cancellation up to 24 hours before check-in',
      refundPercentage: 100,
      deadlineHours: 24
    },
    moderate: {
      name: 'Moderate',
      description: 'Free cancellation up to 5 days before check-in. 50% refund after that.',
      refundPercentage: 50,
      deadlineHours: 120
    },
    strict: {
      name: 'Strict',
      description: 'Free cancellation up to 7 days before check-in. No refund after that.',
      refundPercentage: 0,
      deadlineHours: 168
    }
  };

  return policies[policy] || policies.flexible;
};
