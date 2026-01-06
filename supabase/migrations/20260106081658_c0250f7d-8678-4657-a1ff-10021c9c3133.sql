-- Create unified platform_inbox table
CREATE TABLE public.platform_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID REFERENCES auth.users(id),
  
  -- Type discriminator
  type TEXT NOT NULL CHECK (type IN ('support', 'feedback')),
  
  -- Common fields
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'planned', 'resolved', 'implemented', 'closed')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Contact info (optional for logged-in users)
  email TEXT,
  name TEXT,
  
  -- Support-specific fields
  ticket_number TEXT UNIQUE,
  attachments TEXT[],
  assigned_to UUID REFERENCES auth.users(id),
  
  -- Resolution fields
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  
  -- Feedback-specific fields
  votes INTEGER DEFAULT 0,
  
  -- Admin notes and archival
  admin_notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_platform_inbox_organization ON public.platform_inbox(organization_id);
CREATE INDEX idx_platform_inbox_type ON public.platform_inbox(type);
CREATE INDEX idx_platform_inbox_status ON public.platform_inbox(status);
CREATE INDEX idx_platform_inbox_user ON public.platform_inbox(user_id);
CREATE INDEX idx_platform_inbox_assigned ON public.platform_inbox(assigned_to);

-- Enable RLS
ALTER TABLE public.platform_inbox ENABLE ROW LEVEL SECURITY;

-- Platform admins can view all inbox items
CREATE POLICY "Platform admins can view all inbox items"
ON public.platform_inbox
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
    AND platform_admins.is_active = true
  )
);

-- Platform admins can manage all inbox items
CREATE POLICY "Platform admins can manage all inbox items"
ON public.platform_inbox
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
    AND platform_admins.is_active = true
  )
);

-- Organization admins can view their organization's inbox items
CREATE POLICY "Org admins can view org inbox items"
ON public.platform_inbox
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members
    WHERE user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Users can view their own inbox items
CREATE POLICY "Users can view own inbox items"
ON public.platform_inbox
FOR SELECT
USING (user_id = auth.uid());

-- Anyone can create inbox items (for anonymous feedback/support)
CREATE POLICY "Anyone can create inbox items"
ON public.platform_inbox
FOR INSERT
WITH CHECK (true);

-- Users can update their own inbox items
CREATE POLICY "Users can update own inbox items"
ON public.platform_inbox
FOR UPDATE
USING (user_id = auth.uid());

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  IF NEW.type = 'support' AND NEW.ticket_number IS NULL THEN
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.platform_inbox
    WHERE ticket_number IS NOT NULL;
    
    NEW.ticket_number := 'TKT-' || LPAD(next_num::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for ticket number generation
CREATE TRIGGER generate_ticket_number_trigger
BEFORE INSERT ON public.platform_inbox
FOR EACH ROW
EXECUTE FUNCTION public.generate_ticket_number();

-- Create trigger for updated_at
CREATE TRIGGER update_platform_inbox_updated_at
BEFORE UPDATE ON public.platform_inbox
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing support tickets
INSERT INTO public.platform_inbox (
  organization_id, user_id, type, category, priority, status,
  subject, description, email, name, ticket_number, attachments,
  assigned_to, resolved_at, resolved_by, resolution_notes,
  admin_notes, is_archived, created_at, updated_at
)
SELECT
  organization_id,
  user_id,
  'support',
  category,
  priority,
  CASE 
    WHEN status = 'pending' THEN 'open'
    WHEN status = 'in_progress' THEN 'in_progress'
    WHEN status = 'resolved' THEN 'resolved'
    WHEN status = 'closed' THEN 'closed'
    ELSE 'open'
  END,
  subject,
  description,
  email,
  name,
  ticket_number,
  attachments,
  assigned_to,
  resolved_at,
  resolved_by,
  resolution_notes,
  NULL,
  COALESCE(is_archived, false),
  created_at,
  updated_at
FROM public.support_tickets;

-- Migrate existing user feedback
INSERT INTO public.platform_inbox (
  organization_id, user_id, type, category, priority, status,
  subject, description, votes, admin_notes,
  is_archived, created_at, updated_at
)
SELECT
  organization_id,
  user_id,
  'feedback',
  COALESCE(feedback_type, 'general'),
  COALESCE(priority, 'medium'),
  CASE 
    WHEN status = 'new' THEN 'open'
    WHEN status = 'under_review' THEN 'in_progress'
    WHEN status = 'planned' THEN 'planned'
    WHEN status = 'in_progress' THEN 'in_progress'
    WHEN status = 'implemented' THEN 'implemented'
    WHEN status = 'declined' THEN 'closed'
    ELSE 'open'
  END,
  title,
  description,
  COALESCE(votes, 0),
  admin_notes,
  COALESCE(is_archived, false),
  created_at,
  updated_at
FROM public.user_feedback;