-- Add unique constraint to sync_metadata table for proper upsert operations
ALTER TABLE public.sync_metadata 
ADD CONSTRAINT sync_metadata_property_sync_type_unique 
UNIQUE (property_id, sync_type);

-- Also add an index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_sync_metadata_property_sync_type 
ON public.sync_metadata(property_id, sync_type);