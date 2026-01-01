-- Add show_in_nav and nav_order columns to pages table
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS show_in_nav boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS nav_order integer DEFAULT 0;

-- Add index for efficient querying of navigation pages
CREATE INDEX IF NOT EXISTS idx_pages_nav ON public.pages (organization_id, is_published, show_in_nav, nav_order) 
WHERE is_published = true AND show_in_nav = true;