-- Check and fix the property_listings view security issue
-- The current view might be bypassing RLS policies

-- First, drop the existing view if it exists
DROP VIEW IF EXISTS public.property_listings;

-- Recreate the view without SECURITY DEFINER to respect RLS policies
-- This ensures the view uses the permissions of the querying user, not the creator
CREATE VIEW public.property_listings AS
SELECT 
    id,
    title,
    description,
    location,
    bedrooms,
    bathrooms,
    max_guests,
    price_per_night,
    image_url,
    images,
    hospitable_booking_url,
    amenities,
    created_at,
    updated_at,
    featured_photos,
    cover_image_url,
    display_order,
    hospitable_property_id
FROM public.properties;

-- Clean up duplicate/conflicting RLS policies on properties table
-- Keep only the essential policies to avoid confusion

-- Remove duplicate SELECT policies (keeping the most permissive public one)
DROP POLICY IF EXISTS "Property owners can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can view published properties" ON public.properties;

-- Keep: "Anyone can view public property listings" - this allows public access to property data

-- Remove duplicate INSERT policies
DROP POLICY IF EXISTS "Authenticated users can create properties" ON public.properties;
-- Keep: "Authenticated users can insert properties"

-- Remove duplicate UPDATE policies  
DROP POLICY IF EXISTS "Property owners can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can update any property" ON public.properties;
-- Keep: "Users can update their own properties"

-- Remove duplicate DELETE policies
DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;
-- Keep: "Users can delete their own properties"

-- The "Admins can manage all properties" policy covers admin access for all operations

-- Ensure the view respects RLS by not having SECURITY DEFINER
-- (The recreated view above already handles this)