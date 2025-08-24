-- Create unified places table combining POI and lifestyle gallery
CREATE TABLE public.places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- dining, outdoor, entertainment, shopping, accommodation, etc.
  subcategory TEXT, -- restaurant, brewery, winery, hiking, etc.
  
  -- Location data
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  location TEXT, -- general location description
  
  -- Contact and website info
  phone TEXT,
  website_url TEXT,
  
  -- Ratings and features
  rating NUMERIC,
  price_level INTEGER, -- 1-4 scale
  
  -- Media
  image_url TEXT,
  images TEXT[], -- array of image URLs
  
  -- Display and status
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  
  -- Activity-specific fields (from lifestyle gallery)
  activity_type TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Create policies for places
CREATE POLICY "Admins can manage places" 
ON public.places 
FOR ALL 
USING (is_admin());

CREATE POLICY "Anyone can view active places" 
ON public.places 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_places_updated_at
BEFORE UPDATE ON public.places
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate data from points_of_interest
INSERT INTO public.places (
  name, description, category, address, latitude, longitude, location,
  phone, website_url, rating, price_level, image_url,
  is_featured, is_active, display_order, created_at, updated_at, created_by
)
SELECT 
  name, description, 
  COALESCE(category, 'general') as category,
  address, latitude, longitude, location,
  phone, website_url, rating, price_level, image_url,
  is_featured, is_active, display_order, created_at, updated_at, created_by
FROM public.points_of_interest
WHERE is_active = true;

-- Migrate data from lifestyle_gallery
INSERT INTO public.places (
  name, description, category, location, image_url, activity_type,
  is_featured, is_active, display_order, status, created_at, updated_at, created_by
)
SELECT 
  title as name, description,
  COALESCE(category, 'lifestyle') as category,
  location, image_url, activity_type,
  is_featured, is_active, display_order, status, created_at, updated_at, created_by
FROM public.lifestyle_gallery
WHERE is_active = true;

-- Add relationship between events and places
ALTER TABLE public.eugene_events ADD COLUMN place_id UUID REFERENCES public.places(id);

-- Create index for better performance
CREATE INDEX idx_places_category ON public.places(category);
CREATE INDEX idx_places_location ON public.places(latitude, longitude);
CREATE INDEX idx_places_featured ON public.places(is_featured, is_active);
CREATE INDEX idx_events_place ON public.eugene_events(place_id);