-- Create property_fees table for custom fees
CREATE TABLE public.property_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  fee_name TEXT NOT NULL,
  fee_type TEXT NOT NULL DEFAULT 'flat' CHECK (fee_type IN ('flat', 'percentage')),
  fee_amount NUMERIC NOT NULL,
  fee_applies_to TEXT NOT NULL DEFAULT 'booking' CHECK (fee_applies_to IN ('booking', 'per_night', 'per_guest')),
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_fees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage property fees"
ON public.property_fees
FOR ALL
USING (is_admin());

CREATE POLICY "Public can view active property fees"
ON public.property_fees
FOR SELECT
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_property_fees_updated_at
BEFORE UPDATE ON public.property_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_property_fees_property_id ON public.property_fees(property_id);
CREATE INDEX idx_property_fees_active ON public.property_fees(property_id, is_active);