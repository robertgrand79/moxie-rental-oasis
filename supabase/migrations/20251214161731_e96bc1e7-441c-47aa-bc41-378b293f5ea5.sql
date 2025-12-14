-- Phase 4: Add extensible platform integration columns to guest_communications
ALTER TABLE public.guest_communications 
ADD COLUMN IF NOT EXISTS source_platform TEXT DEFAULT 'direct',
ADD COLUMN IF NOT EXISTS external_message_id TEXT,
ADD COLUMN IF NOT EXISTS raw_platform_data JSONB;

-- Create index for platform message deduplication
CREATE INDEX IF NOT EXISTS idx_guest_communications_external_id 
ON public.guest_communications(source_platform, external_message_id) 
WHERE external_message_id IS NOT NULL;

-- Phase 3: Add snooze functionality to threads
ALTER TABLE public.guest_inbox_threads
ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS ai_summary_updated_at TIMESTAMPTZ;

-- Create index for snoozed threads
CREATE INDEX IF NOT EXISTS idx_guest_inbox_threads_snoozed 
ON public.guest_inbox_threads(organization_id, snoozed_until) 
WHERE snoozed_until IS NOT NULL;

-- Add status option for snoozed
-- Update the trigger to handle snooze expiration
CREATE OR REPLACE FUNCTION public.update_inbox_thread_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the thread's last message info
  IF NEW.thread_id IS NOT NULL THEN
    UPDATE public.guest_inbox_threads
    SET 
      last_message_at = COALESCE(NEW.sent_at, NEW.created_at),
      last_message_preview = LEFT(NEW.message_content, 100),
      is_read = CASE WHEN NEW.direction = 'inbound' THEN false ELSE is_read END,
      status = CASE 
        WHEN NEW.direction = 'inbound' THEN 'awaiting_reply'
        ELSE status 
      END,
      snoozed_until = CASE 
        WHEN NEW.direction = 'inbound' THEN NULL  -- Cancel snooze on new inbound
        ELSE snoozed_until 
      END,
      updated_at = now()
    WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to auto-link communications to threads
CREATE OR REPLACE FUNCTION public.auto_link_communication_to_thread()
RETURNS TRIGGER AS $$
DECLARE
  v_thread_id UUID;
  v_org_id UUID;
  v_guest_email TEXT;
  v_guest_name TEXT;
  v_guest_phone TEXT;
BEGIN
  -- Only process if thread_id is not already set
  IF NEW.thread_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get reservation details to find guest info and org
  SELECT 
    p.organization_id,
    r.guest_email,
    r.guest_name,
    r.guest_phone
  INTO v_org_id, v_guest_email, v_guest_name, v_guest_phone
  FROM public.property_reservations r
  JOIN public.properties p ON r.property_id = p.id
  WHERE r.id = NEW.reservation_id;

  -- If we have guest email and org, get or create thread
  IF v_org_id IS NOT NULL AND (v_guest_email IS NOT NULL OR v_guest_phone IS NOT NULL) THEN
    v_thread_id := public.get_or_create_inbox_thread(
      v_org_id,
      v_guest_email,
      v_guest_name,
      v_guest_phone
    );
    NEW.thread_id := v_thread_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-link communications
DROP TRIGGER IF EXISTS auto_link_communication_thread ON public.guest_communications;
CREATE TRIGGER auto_link_communication_thread
BEFORE INSERT ON public.guest_communications
FOR EACH ROW
EXECUTE FUNCTION public.auto_link_communication_to_thread();