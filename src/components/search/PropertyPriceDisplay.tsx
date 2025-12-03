import React from 'react';
import { useBookingCharges } from '@/hooks/useBookingCharges';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays, parseISO } from 'date-fns';

interface PropertyPriceDisplayProps {
  propertyId: string;
  checkin: string;
  checkout: string;
  basePricePerNight?: number;
}

const PropertyPriceDisplay = ({ propertyId, checkin, checkout, basePricePerNight }: PropertyPriceDisplayProps) => {
  const { data: charges, isLoading, isError } = useBookingCharges(
    propertyId,
    checkin,
    checkout,
    !!checkin && !!checkout
  );

  const nights = differenceInDays(parseISO(checkout), parseISO(checkin));

  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg mb-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
    );
  }

  // Fallback to base price if charges failed to load
  if (isError || !charges) {
    if (basePricePerNight) {
      const totalEstimate = basePricePerNight * nights;
      return (
        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg mb-4">
          <span className="text-base font-semibold text-foreground">
            ${basePricePerNight.toLocaleString()}/night
          </span>
          <span className="text-sm text-muted-foreground">
            ~${totalEstimate.toLocaleString()} ({nights} {nights === 1 ? 'night' : 'nights'})
          </span>
        </div>
      );
    }
    return null;
  }

  const perNight = Math.round(charges.accommodationSubtotal / nights);

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-lg mb-4 border border-primary/10">
      <span className="text-base font-semibold text-primary">
        ${perNight.toLocaleString()}/night
      </span>
      <span className="text-sm text-muted-foreground">
        ${Math.round(charges.grandTotal).toLocaleString()} total ({nights} {nights === 1 ? 'night' : 'nights'})
      </span>
    </div>
  );
};

export default PropertyPriceDisplay;
