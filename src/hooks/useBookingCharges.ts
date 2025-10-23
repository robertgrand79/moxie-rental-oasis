import { useQuery } from '@tanstack/react-query';
import { calculateBookingCharges, BookingChargesBreakdown } from '@/utils/calculateBookingCharges';

export const useBookingCharges = (
  propertyId: string,
  checkInDate: string,
  checkOutDate: string,
  enabled: boolean = true
) => {
  return useQuery<BookingChargesBreakdown>({
    queryKey: ['booking-charges', propertyId, checkInDate, checkOutDate],
    queryFn: () => calculateBookingCharges(propertyId, checkInDate, checkOutDate),
    enabled: enabled && !!propertyId && !!checkInDate && !!checkOutDate,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
};
