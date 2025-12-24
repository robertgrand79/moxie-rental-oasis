import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Tag, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromoCodeInputProps {
  propertyId: string;
  organizationId: string;
  guestEmail: string;
  nights: number;
  bookingTotal: number;
  onPromoApplied: (promoData: AppliedPromo | null) => void;
  appliedPromo: AppliedPromo | null;
  className?: string;
}

export interface AppliedPromo {
  promoId: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountAmount: number;
  calculatedDiscount: number;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  propertyId,
  organizationId,
  guestEmail,
  nights,
  bookingTotal,
  onPromoApplied,
  appliedPromo,
  className
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(!appliedPromo);

  const handleApplyCode = async () => {
    if (!code.trim()) return;
    
    setIsValidating(true);
    setError(null);

    try {
      // Use the database function to validate
      const { data, error: rpcError } = await supabase.rpc('validate_promo_code', {
        p_code: code.trim(),
        p_property_id: propertyId,
        p_organization_id: organizationId,
        p_guest_email: guestEmail || 'guest@temp.com',
        p_nights: nights,
        p_booking_total: bookingTotal
      });

      if (rpcError) {
        console.error('Promo validation error:', rpcError);
        setError('Unable to validate promo code. Please try again.');
        return;
      }

      const result = data?.[0];
      
      if (!result?.is_valid) {
        setError(result?.error_message || 'Invalid promo code');
        return;
      }

      // Apply the promo code
      onPromoApplied({
        promoId: result.promo_id,
        code: code.trim().toUpperCase(),
        discountType: result.discount_type as 'percentage' | 'flat',
        discountAmount: result.discount_amount,
        calculatedDiscount: result.calculated_discount
      });
      
      setShowInput(false);
      setCode('');
    } catch (err: any) {
      console.error('Error validating promo code:', err);
      setError('Unable to validate promo code. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromo = () => {
    onPromoApplied(null);
    setShowInput(true);
    setCode('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApplyCode();
    }
  };

  const formatDiscount = (promo: AppliedPromo) => {
    if (promo.discountType === 'percentage') {
      return `${promo.discountAmount}% off`;
    }
    return `$${promo.discountAmount} off`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {appliedPromo && !showInput ? (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{appliedPromo.code}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {formatDiscount(appliedPromo)}
                </Badge>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                You're saving ${appliedPromo.calculatedDiscount.toFixed(2)}!
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemovePromo}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Promo Code
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter code"
                className={cn(
                  "font-mono uppercase",
                  error && "border-destructive focus-visible:ring-destructive"
                )}
                disabled={isValidating}
              />
            </div>
            <Button
              onClick={handleApplyCode}
              disabled={!code.trim() || isValidating}
              variant="outline"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
