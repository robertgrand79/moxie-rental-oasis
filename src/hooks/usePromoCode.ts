import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AppliedPromo } from '@/components/booking/PromoCodeInput';

interface UsePromoCodeProps {
  propertyId: string;
  organizationId: string;
  onDiscountChange?: (discount: number) => void;
}

export const usePromoCode = ({ propertyId, organizationId, onDiscountChange }: UsePromoCodeProps) => {
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validatePromoCode = useCallback(async (
    code: string,
    guestEmail: string,
    nights: number,
    bookingTotal: number
  ): Promise<AppliedPromo | null> => {
    if (!code.trim()) return null;
    
    setIsValidating(true);
    setValidationError(null);

    try {
      const { data, error } = await supabase.rpc('validate_promo_code', {
        p_code: code.trim(),
        p_property_id: propertyId,
        p_organization_id: organizationId,
        p_guest_email: guestEmail || 'guest@temp.com',
        p_nights: nights,
        p_booking_total: bookingTotal
      });

      if (error) {
        console.error('Promo validation error:', error);
        setValidationError('Unable to validate promo code');
        return null;
      }

      const result = data?.[0];
      
      if (!result?.is_valid) {
        setValidationError(result?.error_message || 'Invalid promo code');
        return null;
      }

      const promo: AppliedPromo = {
        promoId: result.promo_id,
        code: code.trim().toUpperCase(),
        discountType: result.discount_type as 'percentage' | 'flat',
        discountAmount: result.discount_amount,
        calculatedDiscount: result.calculated_discount
      };

      setAppliedPromo(promo);
      onDiscountChange?.(promo.calculatedDiscount);
      
      return promo;
    } catch (err: any) {
      console.error('Error validating promo code:', err);
      setValidationError('Unable to validate promo code');
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [propertyId, organizationId, onDiscountChange]);

  const clearPromoCode = useCallback(() => {
    setAppliedPromo(null);
    setValidationError(null);
    onDiscountChange?.(0);
  }, [onDiscountChange]);

  const recordPromoUsage = useCallback(async (
    reservationId: string,
    guestEmail: string,
    discountAmount: number,
    bookingTotal: number
  ) => {
    if (!appliedPromo) return;

    try {
      await supabase.rpc('record_promo_code_usage', {
        p_promo_code_id: appliedPromo.promoId,
        p_reservation_id: reservationId,
        p_guest_email: guestEmail,
        p_discount_amount: discountAmount,
        p_booking_total: bookingTotal,
        p_organization_id: organizationId
      });
    } catch (error) {
      console.error('Error recording promo usage:', error);
      // Don't throw - this is non-critical
    }
  }, [appliedPromo, organizationId]);

  return {
    appliedPromo,
    setAppliedPromo,
    isValidating,
    validationError,
    validatePromoCode,
    clearPromoCode,
    recordPromoUsage
  };
};
