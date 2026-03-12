import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Tag, Percent } from 'lucide-react';
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
    <div className={className}>
      <div className="rounded-2xl border border-border/30 bg-background shadow-lg shadow-black/5 p-6 space-y-4">
        <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Price breakdown</p>
        
        {/* Accommodation */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(charges.pricePerNight)} × {charges.nights} {charges.nights === 1 ? 'night' : 'nights'}
          </span>
          <span>{formatCurrency(charges.accommodationSubtotal)}</span>
        </div>

        {/* Cleaning Fee */}
        {charges.cleaningFee > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cleaning fee</span>
            <span>{formatCurrency(charges.cleaningFee)}</span>
          </div>
        )}

        {/* Service Fee */}
        {charges.serviceFee > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Service fee</span>
            <span>{formatCurrency(charges.serviceFee)}</span>
          </div>
        )}

        {/* Custom Fees */}
        {charges.customFees && charges.customFees.length > 0 && charges.customFees.map((fee) => (
          <div key={fee.id} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{fee.name}</span>
            <span>{formatCurrency(fee.amount)}</span>
          </div>
        ))}

        {/* Discounts */}
        {hasDiscounts && (
          <>
            <Separator className="bg-border/30" />
            <div className="space-y-2.5">
              {charges.discounts.map((discount, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    {discount.type === 'promo' ? (
                      <Tag className="h-3.5 w-3.5" />
                    ) : (
                      <Percent className="h-3.5 w-3.5" />
                    )}
                    {discount.name}
                    {discount.percentage && (
                      <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0">
                        {discount.percentage}% off
                      </Badge>
                    )}
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    -{formatCurrency(discount.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator className="bg-border/30" />

        {/* Subtotal */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(charges.totalBeforeTax)}</span>
        </div>

        {/* Taxes */}
        {charges.taxes.length > 0 && (
          <>
            <Separator className="bg-border/30" />
            <div className="space-y-2.5">
              {charges.taxes.map((tax, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tax.name}
                    {tax.taxType === 'percentage' && ` (${(tax.rate * 100).toFixed(2)}%)`}
                    {tax.taxType === 'flat_per_night' && ` (per night)`}
                  </span>
                  <span>{formatCurrency(tax.amount)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <Separator className="bg-border/30 my-2" />

        {/* Grand Total */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-medium">Total</span>
          <span className="text-3xl font-semibold tracking-tight">{formatCurrency(charges.grandTotal)}</span>
        </div>

        {/* Savings Note */}
        {hasDiscounts && (
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            You're saving {formatCurrency(charges.totalDiscount)} on this booking
          </p>
        )}

        {/* Tax Note */}
        {charges.taxes.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Includes {formatCurrency(charges.totalTax)} in taxes
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingChargesBreakdown;
