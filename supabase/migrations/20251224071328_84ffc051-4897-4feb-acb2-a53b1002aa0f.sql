-- Enhance promotional_codes table with additional restrictions
ALTER TABLE public.promotional_codes
ADD COLUMN IF NOT EXISTS min_booking_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_discount_cap NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS applies_to TEXT DEFAULT 'accommodation' CHECK (applies_to IN ('accommodation', 'total', 'cleaning_fee')),
ADD COLUMN IF NOT EXISTS first_time_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS per_guest_limit INTEGER DEFAULT NULL;

-- Create promo code usage tracking table
CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promotional_codes(id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  guest_email TEXT NOT NULL,
  discount_amount NUMERIC NOT NULL,
  booking_total NUMERIC NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for promo_code_usage
CREATE POLICY "Organization members can view promo code usage" 
ON public.promo_code_usage FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can insert promo code usage"
ON public.promo_code_usage FOR INSERT
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_usage_code ON public.promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_email ON public.promo_code_usage(guest_email);
CREATE INDEX IF NOT EXISTS idx_promo_usage_org ON public.promo_code_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_reservation ON public.promo_code_usage(reservation_id);

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_property_id UUID,
  p_organization_id UUID,
  p_guest_email TEXT,
  p_nights INTEGER,
  p_booking_total NUMERIC
)
RETURNS TABLE(
  is_valid BOOLEAN,
  error_message TEXT,
  promo_id UUID,
  discount_type TEXT,
  discount_amount NUMERIC,
  calculated_discount NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo RECORD;
  v_usage_count INTEGER;
  v_first_booking BOOLEAN;
  v_calc_discount NUMERIC;
BEGIN
  -- Find the promo code
  SELECT * INTO v_promo
  FROM promotional_codes pc
  WHERE UPPER(TRIM(pc.code)) = UPPER(TRIM(p_code))
    AND pc.organization_id = p_organization_id
    AND pc.is_active = true
    AND (pc.property_id IS NULL OR pc.property_id = p_property_id)
    AND pc.valid_from <= NOW()
    AND (pc.valid_until IS NULL OR pc.valid_until >= NOW());

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid or expired promo code'::TEXT, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  -- Check minimum nights
  IF p_nights < COALESCE(v_promo.min_nights, 1) THEN
    RETURN QUERY SELECT false, format('Minimum %s night stay required', v_promo.min_nights)::TEXT, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  -- Check minimum booking value
  IF p_booking_total < COALESCE(v_promo.min_booking_value, 0) THEN
    RETURN QUERY SELECT false, format('Minimum booking value of $%s required', v_promo.min_booking_value)::TEXT, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  -- Check max uses
  IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, 'Promo code has reached its usage limit'::TEXT, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
    RETURN;
  END IF;

  -- Check per-guest limit
  IF v_promo.per_guest_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_usage_count
    FROM promo_code_usage
    WHERE promo_code_id = v_promo.id AND LOWER(guest_email) = LOWER(p_guest_email);
    
    IF v_usage_count >= v_promo.per_guest_limit THEN
      RETURN QUERY SELECT false, 'You have already used this promo code'::TEXT, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
      RETURN;
    END IF;
  END IF;

  -- Check first-time only
  IF v_promo.first_time_only = true THEN
    SELECT NOT EXISTS(
      SELECT 1 FROM reservations r
      WHERE LOWER(r.guest_email) = LOWER(p_guest_email)
        AND r.booking_status != 'cancelled'
    ) INTO v_first_booking;
    
    IF NOT v_first_booking THEN
      RETURN QUERY SELECT false, 'This promo code is for first-time guests only'::TEXT, NULL::UUID, NULL::TEXT, NULL::NUMERIC, NULL::NUMERIC;
      RETURN;
    END IF;
  END IF;

  -- Calculate discount
  IF v_promo.discount_type = 'percentage' THEN
    v_calc_discount := p_booking_total * (v_promo.discount_amount / 100);
  ELSE
    v_calc_discount := v_promo.discount_amount;
  END IF;

  -- Apply max discount cap
  IF v_promo.max_discount_cap IS NOT NULL AND v_calc_discount > v_promo.max_discount_cap THEN
    v_calc_discount := v_promo.max_discount_cap;
  END IF;

  -- Don't exceed booking total
  IF v_calc_discount > p_booking_total THEN
    v_calc_discount := p_booking_total;
  END IF;

  RETURN QUERY SELECT 
    true,
    NULL::TEXT,
    v_promo.id,
    v_promo.discount_type,
    v_promo.discount_amount,
    ROUND(v_calc_discount, 2);
END;
$$;

-- Function to record promo code usage (called after successful booking)
CREATE OR REPLACE FUNCTION record_promo_code_usage(
  p_promo_code_id UUID,
  p_reservation_id UUID,
  p_guest_email TEXT,
  p_discount_amount NUMERIC,
  p_booking_total NUMERIC,
  p_organization_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert usage record
  INSERT INTO promo_code_usage (
    promo_code_id, reservation_id, guest_email, 
    discount_amount, booking_total, organization_id
  ) VALUES (
    p_promo_code_id, p_reservation_id, p_guest_email,
    p_discount_amount, p_booking_total, p_organization_id
  );

  -- Increment current_uses counter
  UPDATE promotional_codes
  SET current_uses = COALESCE(current_uses, 0) + 1,
      updated_at = NOW()
  WHERE id = p_promo_code_id;
END;
$$;