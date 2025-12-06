import React from 'react';
import { Property } from '@/types/property';
import { Calendar, Users } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CustomFeeDetail {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

interface BookingSummaryCardProps {
  property: Property;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
  charges?: {
    accommodationSubtotal: number;
    cleaningFee: number;
    serviceFee: number;
    customFees?: CustomFeeDetail[];
    totalCustomFees?: number;
    subtotal: number;
    totalTax: number;
    grandTotal: number;
  };
}

export const BookingSummaryCard = ({
  property,
  checkInDate,
  checkOutDate,
  guestCount,
  charges
}: BookingSummaryCardProps) => {
  const nights = checkInDate && checkOutDate 
    ? differenceInDays(parseISO(checkOutDate), parseISO(checkInDate))
    : 0;

  const coverImage = property.cover_image_url || property.featured_photos?.[0] || property.images?.[0] || '/placeholder.svg';

  return (
    <Card className="sticky top-24 p-6 space-y-6">
      <div className="space-y-4">
        <div className="aspect-video rounded-lg overflow-hidden">
          <img 
            src={coverImage} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
          <p className="text-sm text-muted-foreground">{property.location}</p>
        </div>
      </div>

      {(checkInDate || checkOutDate || guestCount) && (
        <>
          <Separator />
          <div className="space-y-3">
            {checkInDate && checkOutDate && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {format(parseISO(checkInDate), 'MMM dd, yyyy')} - {format(parseISO(checkOutDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                </div>
              </div>
            )}
            
            {guestCount && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{guestCount} {guestCount === 1 ? 'guest' : 'guests'}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {charges && (
        <>
          <Separator />
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Price Details</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  ${(charges.accommodationSubtotal / nights).toFixed(2)} × {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
                <span className="font-medium">${charges.accommodationSubtotal.toFixed(2)}</span>
              </div>
              
              {charges.cleaningFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cleaning fee</span>
                  <span className="font-medium">${charges.cleaningFee.toFixed(2)}</span>
                </div>
              )}
              
              {charges.serviceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="font-medium">${charges.serviceFee.toFixed(2)}</span>
                </div>
              )}

              {charges.customFees && charges.customFees.length > 0 && charges.customFees.map((fee) => (
                <div key={fee.id} className="flex justify-between">
                  <span className="text-muted-foreground">{fee.name}</span>
                  <span className="font-medium">${fee.amount.toFixed(2)}</span>
                </div>
              ))}
              
              {charges.totalTax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">${charges.totalTax.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold">${charges.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
