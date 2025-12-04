-- Add new columns to property_checklist_item_completions for enhanced checklist runs
ALTER TABLE public.property_checklist_item_completions 
ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS needs_work boolean DEFAULT false;

-- Create storage bucket for checklist photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('checklist-photos', 'checklist-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for checklist photos
CREATE POLICY "Authenticated users can upload checklist photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'checklist-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view checklist photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'checklist-photos');

CREATE POLICY "Authenticated users can delete their checklist photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'checklist-photos' AND auth.uid() IS NOT NULL);