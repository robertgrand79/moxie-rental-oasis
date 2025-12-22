-- Create bug_reports table for admin bug submissions
CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  browser_info TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix')) DEFAULT 'open',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Organization members can create bug reports for their org
CREATE POLICY "Organization members can create bug reports"
ON public.bug_reports
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Policy: Organization members can view their org's bug reports
CREATE POLICY "Organization members can view own org bug reports"
ON public.bug_reports
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
  OR public.is_platform_admin(auth.uid())
);

-- Policy: Platform admins can update any bug report
CREATE POLICY "Platform admins can update bug reports"
ON public.bug_reports
FOR UPDATE
USING (public.is_platform_admin(auth.uid()));

-- Policy: Platform admins can delete bug reports
CREATE POLICY "Platform admins can delete bug reports"
ON public.bug_reports
FOR DELETE
USING (public.is_platform_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for common queries
CREATE INDEX idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX idx_bug_reports_severity ON public.bug_reports(severity);
CREATE INDEX idx_bug_reports_organization ON public.bug_reports(organization_id);
CREATE INDEX idx_bug_reports_created_at ON public.bug_reports(created_at DESC);