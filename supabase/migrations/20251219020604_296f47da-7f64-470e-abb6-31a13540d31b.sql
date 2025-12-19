-- Create home_amenities table for custom amenity items
CREATE TABLE public.home_amenities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Star',
  color TEXT NOT NULL DEFAULT 'text-primary',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.home_amenities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view active amenities"
ON public.home_amenities
FOR SELECT
USING (is_active = true);

CREATE POLICY "Organization admins can manage amenities"
ON public.home_amenities
FOR ALL
USING (user_belongs_to_organization(auth.uid(), organization_id));

-- Create index for faster lookups
CREATE INDEX idx_home_amenities_organization ON public.home_amenities(organization_id);
CREATE INDEX idx_home_amenities_display_order ON public.home_amenities(organization_id, display_order);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_home_amenities_updated_at
BEFORE UPDATE ON public.home_amenities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();