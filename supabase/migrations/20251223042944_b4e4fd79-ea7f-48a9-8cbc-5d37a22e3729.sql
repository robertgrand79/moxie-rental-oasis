-- Add guest_phone column to assistant_escalations table for SMS delivery
ALTER TABLE public.assistant_escalations ADD COLUMN IF NOT EXISTS guest_phone text;

-- Add notified_at column to track when the response was delivered
ALTER TABLE public.assistant_escalations ADD COLUMN IF NOT EXISTS notified_at timestamp with time zone;

-- Enable realtime for assistant_escalations so chat widget can receive updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.assistant_escalations;