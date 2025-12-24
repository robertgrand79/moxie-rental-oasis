-- Create email_failures table for retry mechanism
CREATE TABLE IF NOT EXISTS public.email_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_code TEXT,
  email_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'failed', 'success')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for retry processing
CREATE INDEX IF NOT EXISTS idx_email_failures_pending 
ON public.email_failures(status, next_retry_at) 
WHERE status IN ('pending', 'retrying');

-- Add index for organization queries
CREATE INDEX IF NOT EXISTS idx_email_failures_org 
ON public.email_failures(organization_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.email_failures ENABLE ROW LEVEL SECURITY;

-- Create policy for org admins to view their failures
CREATE POLICY "Org admins can view email failures"
ON public.email_failures
FOR SELECT
USING (
  public.is_platform_admin(auth.uid()) OR
  public.user_belongs_to_organization(auth.uid(), organization_id)
);

-- Create trigger for updated_at
CREATE TRIGGER update_email_failures_updated_at
BEFORE UPDATE ON public.email_failures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.email_failures IS 'Tracks failed email sends for retry mechanism';