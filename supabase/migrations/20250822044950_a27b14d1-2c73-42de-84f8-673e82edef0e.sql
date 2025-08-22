-- Create missing tables and fix testimonials table structure

-- Create properties table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  bedrooms integer NOT NULL,
  bathrooms integer NOT NULL,
  max_guests integer NOT NULL,
  price_per_night numeric,
  image_url text,
  cover_image_url text,
  images text[],
  featured_photos text[],
  hospitable_booking_url text,
  amenities text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

-- Update testimonials table to match the hook interface
DO $$
BEGIN
    -- Add missing columns to testimonials table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'property_id') THEN
        ALTER TABLE public.testimonials ADD COLUMN property_id uuid;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'content') THEN
        ALTER TABLE public.testimonials ADD COLUMN content text;
    END IF;
    
    -- Update testimonials table structure to match both interfaces
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'review_text') THEN
        -- Migrate data from review_text to content if content doesn't have data
        UPDATE public.testimonials SET content = review_text WHERE content IS NULL AND review_text IS NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'guest_location') THEN
        -- guest_location column exists, keep it
        NULL;
    ELSE
        -- Add guest_location if it doesn't exist
        ALTER TABLE public.testimonials ADD COLUMN guest_location text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'stay_date') THEN
        ALTER TABLE public.testimonials ADD COLUMN stay_date date;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'property_name') THEN
        ALTER TABLE public.testimonials ADD COLUMN property_name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'status') THEN
        ALTER TABLE public.testimonials ADD COLUMN status text DEFAULT 'published';
    END IF;
END $$;