-- newsletter_lists + newsletter_list_members: named buckets of email
-- addresses for targeted sending. A list can contain any mix of:
--   - real subscribers (newsletter_subscribers row, with subscriber_id set)
--   - non-subscriber addresses (e.g. internal QA folks, ad-hoc test emails)
--
-- This unified model serves both segmentation ("VIP guests", "Eugene area")
-- and testing ("Internal QA", "Just me"). The same send pipeline targets
-- either case; the only difference is membership composition.
--
-- "All Active Subscribers" is the implicit default — when no list_id is
-- passed to send-newsletter, every newsletter_subscribers row with
-- is_active=true is the recipient set, exactly as today. Adding lists is
-- purely additive: existing sends work unchanged.

CREATE TABLE IF NOT EXISTS public.newsletter_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  -- Flagging "this is primarily for testing" lets us surface those lists
  -- prominently in the Test Send picker and de-emphasize them in the
  -- "Send to list" production picker. Pure UI hint, no behaviour change.
  is_test boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, name)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_lists_org
  ON public.newsletter_lists(organization_id);

CREATE TABLE IF NOT EXISTS public.newsletter_list_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.newsletter_lists(id) ON DELETE CASCADE,
  -- Denormalize org so RLS predicates don't need a JOIN through newsletter_lists
  -- (matches the pattern used by newsletter_suppression).
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  -- When the member maps to an actual newsletter_subscribers row, link it.
  -- Null when the member is a non-subscriber test address. We don't use a
  -- FK constraint because subscribers can be deleted independently of the
  -- list and we want the list entry to survive (with subscriber_id=null).
  subscriber_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (list_id, email)
);

CREATE INDEX IF NOT EXISTS idx_newsletter_list_members_list
  ON public.newsletter_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_list_members_email
  ON public.newsletter_list_members(organization_id, email);

ALTER TABLE public.newsletter_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_list_members ENABLE ROW LEVEL SECURITY;

-- Lists CRUD: org admins only.
CREATE POLICY "Org admins can view newsletter lists"
  ON public.newsletter_lists FOR SELECT TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "Org admins can insert newsletter lists"
  ON public.newsletter_lists FOR INSERT TO authenticated
  WITH CHECK (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "Org admins can update newsletter lists"
  ON public.newsletter_lists FOR UPDATE TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()))
  WITH CHECK (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "Org admins can delete newsletter lists"
  ON public.newsletter_lists FOR DELETE TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

-- Members CRUD: same rule via the denormalized organization_id column.
CREATE POLICY "Org admins can view list members"
  ON public.newsletter_list_members FOR SELECT TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "Org admins can insert list members"
  ON public.newsletter_list_members FOR INSERT TO authenticated
  WITH CHECK (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "Org admins can delete list members"
  ON public.newsletter_list_members FOR DELETE TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));
