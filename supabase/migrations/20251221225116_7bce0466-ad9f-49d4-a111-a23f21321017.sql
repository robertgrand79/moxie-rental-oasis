
-- Add organization_id to critical tables that need tenant isolation
-- These tables currently have no isolation mechanism

-- 1. chat_sessions - guest chat needs org isolation
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 2. community_updates - content needs org isolation  
ALTER TABLE public.community_updates
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 3. newsletter_subscribers - marketing data needs isolation
ALTER TABLE public.newsletter_subscribers
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 4. newsletter_campaigns - campaigns need isolation
ALTER TABLE public.newsletter_campaigns  
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 5. tax_rates - financial config needs isolation
ALTER TABLE public.tax_rates
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 6. seam_workspaces - device integration needs isolation
ALTER TABLE public.seam_workspaces
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Backfill existing records with default organization
UPDATE public.chat_sessions SET organization_id = 'a0000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.community_updates SET organization_id = 'a0000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.newsletter_subscribers SET organization_id = 'a0000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.newsletter_campaigns SET organization_id = 'a0000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.tax_rates SET organization_id = 'a0000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE public.seam_workspaces SET organization_id = 'a0000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;

-- Update RLS policies to use organization_id

-- chat_sessions: Drop old policies and create org-based ones
DROP POLICY IF EXISTS "Admins can manage chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Admins can view all chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Public can create validated chat sessions" ON public.chat_sessions;

CREATE POLICY "Organization members can view chat sessions"
ON public.chat_sessions FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Organization members can manage chat sessions"
ON public.chat_sessions FOR ALL
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Public can create chat sessions"
ON public.chat_sessions FOR INSERT
WITH CHECK (true);

-- community_updates: Update to use org isolation
DROP POLICY IF EXISTS "Admins can delete updates" ON public.community_updates;
DROP POLICY IF EXISTS "Admins can update updates" ON public.community_updates;
DROP POLICY IF EXISTS "Authenticated users can create updates" ON public.community_updates;
DROP POLICY IF EXISTS "Public can view published updates" ON public.community_updates;

CREATE POLICY "Organization members can manage updates"
ON public.community_updates FOR ALL
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Public can view published updates"
ON public.community_updates FOR SELECT
USING (status = 'published' AND (publish_at IS NULL OR publish_at <= now()));

-- newsletter_subscribers: Add org isolation
CREATE POLICY "Organization members can manage subscribers"
ON public.newsletter_subscribers FOR ALL
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Public can subscribe"
ON public.newsletter_subscribers FOR INSERT
WITH CHECK (true);

-- newsletter_campaigns: Add org isolation  
CREATE POLICY "Organization members can manage campaigns"
ON public.newsletter_campaigns FOR ALL
USING (user_belongs_to_organization(auth.uid(), organization_id));

-- tax_rates: Add org isolation
DROP POLICY IF EXISTS "Authenticated users can view tax rates" ON public.tax_rates;
DROP POLICY IF EXISTS "Admins can manage tax rates" ON public.tax_rates;

CREATE POLICY "Organization members can view tax rates"
ON public.tax_rates FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Organization admins can manage tax rates"
ON public.tax_rates FOR ALL
USING (user_is_org_admin(auth.uid(), organization_id));

-- seam_workspaces: Add org isolation
DROP POLICY IF EXISTS "Admins can manage seam workspaces" ON public.seam_workspaces;
DROP POLICY IF EXISTS "Authenticated users can view seam workspaces" ON public.seam_workspaces;

CREATE POLICY "Organization members can view seam workspaces"
ON public.seam_workspaces FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Organization admins can manage seam workspaces"
ON public.seam_workspaces FOR ALL
USING (user_is_org_admin(auth.uid(), organization_id));
