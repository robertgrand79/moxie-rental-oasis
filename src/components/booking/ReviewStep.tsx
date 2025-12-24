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
  const coverImage = property.cover_image_url || property.featured_photos?.[0] || property.images?.[0] || '/placeholder.svg';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Confirm</h2>
        <p className="text-muted-foreground">Please review your booking details before confirming</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Property Details */}
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Property</h3>
            <div className="flex gap-4">
              <img 
                src={coverImage} 
                alt={property.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium line-clamp-2">{property.title}</h4>
                <p className="text-sm text-muted-foreground">{property.location}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Stay Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Check-in</p>
                  <p className="text-sm text-muted-foreground">{format(parseISO(checkInDate), 'EEEE, MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Check-out</p>
                  <p className="text-sm text-muted-foreground">{format(parseISO(checkOutDate), 'EEEE, MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">
                  <span className="font-medium">{formData.guestCount}</span> {formData.guestCount === 1 ? 'guest' : 'guests'}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {nights} {nights === 1 ? 'night' : 'nights'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Guest Information */}
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Guest Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">{formData.guestName}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm">{formData.guestEmail}</p>
              </div>
              {formData.guestPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm">{formData.guestPhone}</p>
                </div>
              )}
              {formData.specialRequests && (
                <div className="flex items-start gap-3 pt-2">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Special Requests</p>
                    <p className="text-sm text-muted-foreground">{formData.specialRequests}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Price Breakdown</h3>
            <div className="space-y-2 text-sm">
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
                  <span className="flex items-center gap-1">
                    {discount.type === 'promo' ? <Tag className="h-3 w-3" /> : <Percent className="h-3 w-3" />}
                    {discount.name}
                    {discount.percentage && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ml-1">
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
              <Separator />
              <div className="flex justify-between items-baseline font-semibold text-base pt-1">
                <span>Total</span>
                <span className="text-2xl">${charges.grandTotal.toFixed(2)}</span>
              </div>
              {charges.totalDiscount && charges.totalDiscount > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  You're saving ${charges.totalDiscount.toFixed(2)} on this booking!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
