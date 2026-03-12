import React from 'react';
import { Property } from '@/types/property';
import { Calendar, Users, Mail, Phone, User, FileText, Tag, Percent } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface CustomFeeDetail {
  id: string;
  name: string;
  amount: number;
  description?: string;
}

interface DiscountDetail {
  type: 'promo' | 'length_of_stay';
  name: string;
  amount: number;
  percentage?: number;
}

interface ReviewStepProps {
  property: Property;
  checkInDate: string;
  checkOutDate: string;
  formData: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    guestCount: number;
    specialRequests: string;
  };
  charges: {
    accommodationSubtotal: number;
    cleaningFee: number;
    serviceFee: number;
    customFees?: CustomFeeDetail[];
    totalCustomFees?: number;
    subtotal: number;
    totalTax: number;
    grandTotal: number;
    discounts?: DiscountDetail[];
    totalDiscount?: number;
  };
}

export const ReviewStep = ({
  property,
  checkInDate,
  checkOutDate,
  formData,
  charges
}: ReviewStepProps) => {
  const nights = differenceInDays(parseISO(checkOutDate), parseISO(checkInDate));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-1">Review your booking</h2>
        <p className="text-sm text-muted-foreground">Please confirm the details below before proceeding to payment</p>
      </div>

      {/* Stay Details */}
      <div className="rounded-2xl border border-border/30 bg-muted/20 p-6 space-y-5">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Stay details</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Check-in</p>
            <p className="text-sm font-medium">{format(parseISO(checkInDate), 'EEEE, MMM dd, yyyy')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Check-out</p>
            <p className="text-sm font-medium">{format(parseISO(checkOutDate), 'EEEE, MMM dd, yyyy')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-sm font-medium">{nights} {nights === 1 ? 'night' : 'nights'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Guests</p>
            <p className="text-sm font-medium">{formData.guestCount} {formData.guestCount === 1 ? 'guest' : 'guests'}</p>
          </div>
        </div>
      </div>

      {/* Guest Information */}
      <div className="rounded-2xl border border-border/30 bg-muted/20 p-6 space-y-5">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Guest information</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{formData.guestName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{formData.guestEmail}</p>
          </div>
          {formData.guestPhone && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{formData.guestPhone}</p>
            </div>
          )}
        </div>
        
        {formData.specialRequests && (
          <>
            <Separator className="bg-border/30" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Special requests</p>
              <p className="text-sm text-muted-foreground">{formData.specialRequests}</p>
            </div>
          </>
        )}
      </div>

      {/* Price Breakdown (visible on mobile where summary card isn't always visible) */}
      <div className="rounded-2xl border border-border/30 bg-muted/20 p-6 space-y-4 lg:hidden">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Price breakdown</p>
        
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              ${(charges.accommodationSubtotal / nights).toFixed(2)} × {nights} {nights === 1 ? 'night' : 'nights'}
            </span>
            <span>${charges.accommodationSubtotal.toFixed(2)}</span>
          </div>
          {charges.cleaningFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cleaning fee</span>
              <span>${charges.cleaningFee.toFixed(2)}</span>
            </div>
          )}
          {charges.serviceFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service fee</span>
              <span>${charges.serviceFee.toFixed(2)}</span>
            </div>
          )}
          {charges.customFees && charges.customFees.length > 0 && charges.customFees.map((fee) => (
            <div key={fee.id} className="flex justify-between">
              <span className="text-muted-foreground">{fee.name}</span>
              <span>${fee.amount.toFixed(2)}</span>
            </div>
          ))}
          {/* Discounts */}
          {charges.discounts && charges.discounts.length > 0 && charges.discounts.map((discount, index) => (
            <div key={index} className="flex justify-between text-green-600 dark:text-green-400">
              <span className="flex items-center gap-1.5">
                {discount.type === 'promo' ? <Tag className="h-3 w-3" /> : <Percent className="h-3 w-3" />}
                {discount.name}
                {discount.percentage && (
                  <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0">
                    {discount.percentage}% off
                  </Badge>
                )}
              </span>
              <span>-${discount.amount.toFixed(2)}</span>
            </div>
          ))}
          {charges.totalTax > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes</span>
              <span>${charges.totalTax.toFixed(2)}</span>
            </div>
          )}
          <Separator className="bg-border/30" />
          <div className="flex justify-between items-baseline pt-1">
            <span className="font-medium">Total</span>
            <span className="text-3xl font-semibold tracking-tight">${charges.grandTotal.toFixed(2)}</span>
          </div>
          {charges.totalDiscount && charges.totalDiscount > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              You're saving ${charges.totalDiscount.toFixed(2)} on this booking
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
