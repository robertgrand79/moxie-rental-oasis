import { useQuery } from '@tanstack/react-query';
import { calculateBookingCharges, BookingChargesBreakdown } from '@/utils/calculateBookingCharges';

export const useBookingCharges = (
  propertyId: string,
  checkInDate: string,
  checkOutDate: string,
  enabled: boolean = true,
  guestCount: number = 1,
  promoCode?: string
) => {
  return useQuery<BookingChargesBreakdown>({
    queryKey: ['booking-charges', propertyId, checkInDate, checkOutDate, guestCount, promoCode],
    queryFn: () => calculateBookingCharges(propertyId, checkInDate, checkOutDate, guestCount, promoCode),
    enabled: enabled && !!propertyId && !!checkInDate && !!checkOutDate,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });
};
