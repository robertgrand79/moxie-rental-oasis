-- Add columns to support inbound emails in guest_communications
ALTER TABLE public.guest_communications 
ADD COLUMN IF NOT EXISTS direction text DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
ADD COLUMN IF NOT EXISTS sender_email text,
ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS raw_email_data jsonb;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guest_communications_direction ON public.guest_communications(direction);
CREATE INDEX IF NOT EXISTS idx_guest_communications_is_read ON public.guest_communications(is_read);

-- Update existing records to have direction = 'outbound'
UPDATE public.guest_communications SET direction = 'outbound' WHERE direction IS NULL;