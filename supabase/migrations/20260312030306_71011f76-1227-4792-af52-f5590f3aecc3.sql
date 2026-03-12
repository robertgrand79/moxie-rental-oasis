
ALTER TABLE public.guest_communications 
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_guest_communications_archived 
ON public.guest_communications(thread_id, is_archived) 
WHERE is_archived = false;
