-- Platform announcements/campaigns table
CREATE TABLE public.platform_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT NOT NULL CHECK (announcement_type IN ('announcement', 'campaign', 'banner')),
  target_tiers TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT now(),
  ends_at TIMESTAMPTZ,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  banner_style TEXT DEFAULT 'info' CHECK (banner_style IN ('info', 'warning', 'success', 'error')),
  cta_text TEXT,
  cta_url TEXT,
  email_subject TEXT,
  email_sent_at TIMESTAMPTZ,
  email_sent_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track which orgs have seen/dismissed announcements
CREATE TABLE public.platform_announcement_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES public.platform_announcements(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  dismissed_at TIMESTAMPTZ,
  clicked_cta BOOLEAN DEFAULT false,
  UNIQUE(announcement_id, organization_id)
);

-- Enable RLS
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_announcement_views ENABLE ROW LEVEL SECURITY;

-- Platform admins can manage announcements
CREATE POLICY "Platform admins can manage announcements" ON public.platform_announcements
  FOR ALL USING (public.is_platform_admin());

-- Org members can view active announcements for their tier
CREATE POLICY "Org members can view relevant announcements" ON public.platform_announcements
  FOR SELECT USING (
    is_active = true 
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

-- Platform admins can manage all views
CREATE POLICY "Platform admins can manage views" ON public.platform_announcement_views
  FOR ALL USING (public.is_platform_admin());

-- Users can view/create their own org's views
CREATE POLICY "Org members can manage their views" ON public.platform_announcement_views
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Indexes for efficient queries
CREATE INDEX idx_announcements_active ON public.platform_announcements(is_active, starts_at, ends_at);
CREATE INDEX idx_announcements_type ON public.platform_announcements(announcement_type);
CREATE INDEX idx_announcement_views_org ON public.platform_announcement_views(organization_id);

-- Add navigation item entry and route (to be done in code)