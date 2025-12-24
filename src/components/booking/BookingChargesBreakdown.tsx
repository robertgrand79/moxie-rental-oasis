import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bed, Sparkles, Briefcase, Receipt, Tag, Percent } from 'lucide-react';
import { BookingChargesBreakdown as ChargesType } from '@/utils/calculateBookingCharges';
import { Badge } from '@/components/ui/badge';

interface BookingChargesBreakdownProps {
  charges: ChargesType;
  className?: string;
}

const BookingChargesBreakdown = ({ charges, className }: BookingChargesBreakdownProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const hasDiscounts = charges.discounts && charges.discounts.length > 0 && charges.totalDiscount > 0;

  return (
    <Card className={className}>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Price Breakdown</h3>
        
        {/* Accommodation */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bed className="h-4 w-4" />
            <span>
              {formatCurrency(charges.pricePerNight)} × {charges.nights} {charges.nights === 1 ? 'night' : 'nights'}
            </span>
          </div>
          <span className="font-medium">{formatCurrency(charges.accommodationSubtotal)}</span>
        </div>

        {/* Cleaning Fee */}
        {charges.cleaningFee > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Cleaning Fee</span>
            </div>
            <span className="font-medium">{formatCurrency(charges.cleaningFee)}</span>
          </div>
        )}

        {/* Service Fee */}
        {charges.serviceFee > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Service Fee</span>
            </div>
            <span className="font-medium">{formatCurrency(charges.serviceFee)}</span>
          </div>
        )}

        {/* Custom Fees */}
        {charges.customFees && charges.customFees.length > 0 && charges.customFees.map((fee) => (
          <div key={fee.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Receipt className="h-4 w-4" />
              <span>{fee.name}</span>
            </div>
            <span className="font-medium">{formatCurrency(fee.amount)}</span>
          </div>
        ))}

        {/* Discounts */}
        {hasDiscounts && (
          <>
            <Separator />
            <div className="space-y-2">
              {charges.discounts.map((discount, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    {discount.type === 'promo' ? (
                      <Tag className="h-4 w-4" />
                    ) : (
                      <Percent className="h-4 w-4" />
                    )}
                    <span className="flex items-center gap-2">
                      {discount.name}
                      {discount.percentage && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {discount.percentage}% off
                        </Badge>
                      )}
                    </span>
                  </div>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    -{formatCurrency(discount.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator />

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Subtotal</span>
          <span>{formatCurrency(charges.totalBeforeTax)}</span>
        </div>

        {/* Taxes */}
        {charges.taxes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              {charges.taxes.map((tax, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    <span>
                      {tax.name}
                      {tax.taxType === 'percentage' && ` (${(tax.rate * 100).toFixed(2)}%)`}
                      {tax.taxType === 'flat_per_night' && ` (per night)`}
                    </span>
                  </div>
                  <span className="font-medium">{formatCurrency(tax.amount)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator className="my-4" />

        {/* Grand Total */}
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatCurrency(charges.grandTotal)}</span>
        </div>

        {/* Savings Note */}
        {hasDiscounts && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            You're saving {formatCurrency(charges.totalDiscount)} on this booking!
          </p>
        )}

        {/* Tax Note */}
        {charges.taxes.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Includes {formatCurrency(charges.totalTax)} in taxes
          </p>
        )}
      </div>
    </Card>
  );
};

export default BookingChargesBreakdown;
