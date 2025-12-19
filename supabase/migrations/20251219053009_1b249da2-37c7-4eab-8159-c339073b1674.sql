-- Add sms_opt_in column to contractors table for SMS notification preferences
ALTER TABLE public.contractors 
ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.contractors.sms_opt_in IS 'Whether the contractor has opted in to receive SMS notifications for work orders';