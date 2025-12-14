-- Create guest_inbox_threads table for grouping conversations by guest
CREATE TABLE public.guest_inbox_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  guest_identifier TEXT NOT NULL, -- normalized email or phone
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, awaiting_reply, resolved, starred
  is_read BOOLEAN NOT NULL DEFAULT false,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  reservation_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, guest_identifier)
);

-- Add thread_id to guest_communications
ALTER TABLE public.guest_communications 
ADD COLUMN thread_id UUID REFERENCES public.guest_inbox_threads(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.guest_inbox_threads ENABLE ROW LEVEL SECURITY;

-- RLS policies for guest_inbox_threads
CREATE POLICY "Organization members can view inbox threads"
ON public.guest_inbox_threads
FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Organization members can manage inbox threads"
ON public.guest_inbox_threads
FOR ALL
USING (user_belongs_to_organization(auth.uid(), organization_id));

-- Create index for faster lookups
CREATE INDEX idx_guest_inbox_threads_org_status ON public.guest_inbox_threads(organization_id, status);
CREATE INDEX idx_guest_inbox_threads_last_message ON public.guest_inbox_threads(organization_id, last_message_at DESC);
CREATE INDEX idx_guest_communications_thread ON public.guest_communications(thread_id);

-- Function to update thread on new message
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
      status = CASE WHEN NEW.direction = 'inbound' THEN 'awaiting_reply' ELSE status END,
      updated_at = now()
    WHERE id = NEW.thread_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updating thread on new message
CREATE TRIGGER update_thread_on_message
AFTER INSERT ON public.guest_communications
FOR EACH ROW
EXECUTE FUNCTION public.update_inbox_thread_on_message();

-- Function to get or create thread for a guest
CREATE OR REPLACE FUNCTION public.get_or_create_inbox_thread(
  p_organization_id UUID,
  p_guest_email TEXT,
  p_guest_name TEXT DEFAULT NULL,
  p_guest_phone TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_thread_id UUID;
  v_guest_identifier TEXT;
BEGIN
  -- Use email as primary identifier, fallback to phone
  v_guest_identifier := LOWER(COALESCE(p_guest_email, p_guest_phone));
  
  -- Try to find existing thread
  SELECT id INTO v_thread_id
  FROM public.guest_inbox_threads
  WHERE organization_id = p_organization_id
    AND guest_identifier = v_guest_identifier;
  
  -- Create new thread if not found
  IF v_thread_id IS NULL THEN
    INSERT INTO public.guest_inbox_threads (
      organization_id,
      guest_identifier,
      guest_name,
      guest_email,
      guest_phone
    ) VALUES (
      p_organization_id,
      v_guest_identifier,
      p_guest_name,
      p_guest_email,
      p_guest_phone
    )
    RETURNING id INTO v_thread_id;
  ELSE
    -- Update guest info if provided
    UPDATE public.guest_inbox_threads
    SET 
      guest_name = COALESCE(p_guest_name, guest_name),
      guest_phone = COALESCE(p_guest_phone, guest_phone),
      updated_at = now()
    WHERE id = v_thread_id;
  END IF;
  
  RETURN v_thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;