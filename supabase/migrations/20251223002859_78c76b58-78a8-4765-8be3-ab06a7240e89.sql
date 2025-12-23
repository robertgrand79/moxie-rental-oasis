-- Create assistant_escalations table for questions AI can't confidently answer
CREATE TABLE public.assistant_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  conversation_id UUID REFERENCES public.assistant_conversations(id),
  session_id TEXT NOT NULL,
  guest_question TEXT NOT NULL,
  conversation_context JSONB DEFAULT '[]'::jsonb,
  property_id UUID REFERENCES public.properties(id),
  status TEXT NOT NULL DEFAULT 'pending',
  host_response TEXT,
  answered_at TIMESTAMPTZ,
  answered_by UUID REFERENCES public.profiles(id),
  add_to_faq BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ,
  guest_name TEXT,
  guest_email TEXT
);

-- Enable RLS
ALTER TABLE public.assistant_escalations ENABLE ROW LEVEL SECURITY;

-- Organization members can view escalations in their org
CREATE POLICY "Organization members can view escalations"
ON public.assistant_escalations
FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

-- Organization admins can manage escalations
CREATE POLICY "Organization admins can manage escalations"
ON public.assistant_escalations
FOR ALL
USING (user_is_org_admin(auth.uid(), organization_id));

-- System/service role can insert escalations (from edge function)
CREATE POLICY "System can insert escalations"
ON public.assistant_escalations
FOR INSERT
WITH CHECK (true);

-- Create index for efficient querying
CREATE INDEX idx_escalations_org_status ON public.assistant_escalations(organization_id, status);
CREATE INDEX idx_escalations_session ON public.assistant_escalations(session_id);