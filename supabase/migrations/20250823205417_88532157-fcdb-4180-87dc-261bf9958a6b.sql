-- Add airbnb_listing_url to properties table
ALTER TABLE public.properties 
ADD COLUMN airbnb_listing_url TEXT;

-- Add external_review_id to testimonials table for deduplication
ALTER TABLE public.testimonials 
ADD COLUMN external_review_id TEXT UNIQUE;

-- Create sync_metadata table to track API sync status
CREATE TABLE public.sync_metadata (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL DEFAULT 'airbnb_reviews',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status TEXT NOT NULL DEFAULT 'pending',
    total_reviews_found INTEGER DEFAULT 0,
    new_reviews_imported INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sync_metadata
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for sync_metadata
CREATE POLICY "Admins can manage sync metadata"
ON public.sync_metadata
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create trigger for updating sync_metadata timestamps
CREATE TRIGGER update_sync_metadata_updated_at
BEFORE UPDATE ON public.sync_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();