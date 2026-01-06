-- Add archive columns to organizations table
ALTER TABLE public.organizations
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN archived_by UUID REFERENCES auth.users(id) DEFAULT NULL,
ADD COLUMN archive_reason TEXT DEFAULT NULL;

-- Add index for filtering archived organizations
CREATE INDEX idx_organizations_archived_at ON public.organizations(archived_at);

-- Add comment for documentation
COMMENT ON COLUMN public.organizations.archived_at IS 'When the organization was archived. NULL means active.';
COMMENT ON COLUMN public.organizations.archived_by IS 'User who archived the organization';
COMMENT ON COLUMN public.organizations.archive_reason IS 'Reason for archiving (e.g., subscription_cancelled, manual)';