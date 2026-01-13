-- Platform Email Addresses Configuration
-- Stores configured platform email addresses (support@, billing@, etc.)
CREATE TABLE public.platform_email_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_address TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'support', -- 'support', 'billing', 'sales', 'general'
  is_active BOOLEAN DEFAULT true,
  auto_assign_to UUID REFERENCES auth.users(id),
  auto_create_ticket BOOLEAN DEFAULT false,
  resend_domain_verified BOOLEAN DEFAULT false,
  webhook_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Platform Emails (Unified Inbox)
-- Stores all inbound and outbound platform emails
CREATE TABLE public.platform_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_address_id UUID REFERENCES public.platform_email_addresses(id) ON DELETE SET NULL,
  external_email_id TEXT, -- Resend email ID
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_addresses TEXT[] NOT NULL,
  cc_addresses TEXT[],
  bcc_addresses TEXT[],
  reply_to TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  attachments JSONB DEFAULT '[]',
  headers JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,
  labels TEXT[] DEFAULT '{}',
  thread_id UUID, -- Groups emails in same conversation
  parent_email_id UUID REFERENCES public.platform_emails(id) ON DELETE SET NULL,
  in_reply_to TEXT, -- Message-ID being replied to
  references_header TEXT[], -- Message-ID chain for threading
  assigned_to UUID REFERENCES auth.users(id),
  linked_inbox_item_id UUID REFERENCES public.platform_inbox(id) ON DELETE SET NULL,
  linked_organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Platform Email Templates
-- Reusable templates for quick responses
CREATE TABLE public.platform_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  category TEXT DEFAULT 'general', -- 'support', 'billing', 'onboarding', 'general'
  variables TEXT[] DEFAULT '{}', -- Available variables like {{user_name}}, {{org_name}}
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.platform_email_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_email_addresses (platform admins only via platform_admins table)
CREATE POLICY "Platform admins can view email addresses"
ON public.platform_email_addresses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can insert email addresses"
ON public.platform_email_addresses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can update email addresses"
ON public.platform_email_addresses FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can delete email addresses"
ON public.platform_email_addresses FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

-- RLS Policies for platform_emails (platform admins only)
CREATE POLICY "Platform admins can view emails"
ON public.platform_emails FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can insert emails"
ON public.platform_emails FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can update emails"
ON public.platform_emails FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can delete emails"
ON public.platform_emails FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

-- RLS Policies for platform_email_templates (platform admins only)
CREATE POLICY "Platform admins can view templates"
ON public.platform_email_templates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can insert templates"
ON public.platform_email_templates FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can update templates"
ON public.platform_email_templates FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

CREATE POLICY "Platform admins can delete templates"
ON public.platform_email_templates FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE platform_admins.user_id = auth.uid()
  )
);

-- Service role policies for edge functions
CREATE POLICY "Service role full access to email addresses"
ON public.platform_email_addresses FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to emails"
ON public.platform_emails FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to templates"
ON public.platform_email_templates FOR ALL
USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX idx_platform_emails_direction ON public.platform_emails(direction);
CREATE INDEX idx_platform_emails_is_read ON public.platform_emails(is_read) WHERE is_read = false;
CREATE INDEX idx_platform_emails_is_archived ON public.platform_emails(is_archived);
CREATE INDEX idx_platform_emails_thread_id ON public.platform_emails(thread_id);
CREATE INDEX idx_platform_emails_email_address_id ON public.platform_emails(email_address_id);
CREATE INDEX idx_platform_emails_assigned_to ON public.platform_emails(assigned_to);
CREATE INDEX idx_platform_emails_created_at ON public.platform_emails(created_at DESC);
CREATE INDEX idx_platform_emails_linked_inbox ON public.platform_emails(linked_inbox_item_id) WHERE linked_inbox_item_id IS NOT NULL;
CREATE INDEX idx_platform_email_addresses_category ON public.platform_email_addresses(category);
CREATE INDEX idx_platform_email_templates_category ON public.platform_email_templates(category);

-- Trigger for updated_at
CREATE TRIGGER update_platform_email_addresses_updated_at
  BEFORE UPDATE ON public.platform_email_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_emails_updated_at
  BEFORE UPDATE ON public.platform_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_email_templates_updated_at
  BEFORE UPDATE ON public.platform_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();