import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bed, Sparkles, Briefcase, Receipt } from 'lucide-react';
import { BookingChargesBreakdown as ChargesType } from '@/utils/calculateBookingCharges';

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
                      {tax.name} ({(tax.rate * 100).toFixed(2)}%)
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
