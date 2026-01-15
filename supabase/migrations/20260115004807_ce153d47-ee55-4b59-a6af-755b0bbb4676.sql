-- Create ai_usage_overrides table for platform admins to set custom limits
CREATE TABLE public.ai_usage_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  daily_limit INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  CONSTRAINT ai_usage_overrides_organization_id_key UNIQUE (organization_id)
);

-- Enable RLS
ALTER TABLE public.ai_usage_overrides ENABLE ROW LEVEL SECURITY;

-- Only platform admins can manage overrides
CREATE POLICY "Platform admins can manage ai_usage_overrides"
  ON public.ai_usage_overrides
  FOR ALL
  USING (public.is_platform_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_ai_usage_overrides_updated_at
  BEFORE UPDATE ON public.ai_usage_overrides
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();