-- Add tax configuration options to tax_rates
ALTER TABLE public.tax_rates 
ADD COLUMN IF NOT EXISTS tax_type TEXT NOT NULL DEFAULT 'percentage' CHECK (tax_type IN ('percentage', 'flat_per_night', 'flat_per_booking')),
ADD COLUMN IF NOT EXISTS flat_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS applies_to TEXT NOT NULL DEFAULT 'total' CHECK (applies_to IN ('accommodation_only', 'subtotal', 'total'));

-- Add extra guest fee configuration to properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS extra_guest_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_guest_threshold INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS pet_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS pet_fee_type TEXT DEFAULT 'per_stay' CHECK (pet_fee_type IN ('per_stay', 'per_night'));

-- Create promotional_codes table for coupons
CREATE TABLE IF NOT EXISTS public.promotional_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_amount NUMERIC NOT NULL,
  min_nights INTEGER DEFAULT 1,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- Create length_of_stay_discounts table
CREATE TABLE IF NOT EXISTS public.length_of_stay_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  min_nights INTEGER NOT NULL,
  discount_percentage NUMERIC NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.promotional_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.length_of_stay_discounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for promotional_codes
CREATE POLICY "Users can view their organization promo codes" 
ON public.promotional_codes FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Users can manage their organization promo codes" 
ON public.promotional_codes FOR ALL 
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- RLS policies for length_of_stay_discounts
CREATE POLICY "Users can view length of stay discounts" 
ON public.length_of_stay_discounts FOR SELECT 
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can manage length of stay discounts" 
ON public.length_of_stay_discounts FOR ALL 
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_promotional_codes_code ON public.promotional_codes(code);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_org ON public.promotional_codes(organization_id);
CREATE INDEX IF NOT EXISTS idx_los_discounts_property ON public.length_of_stay_discounts(property_id);