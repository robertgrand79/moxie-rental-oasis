-- Add organization_id column to user_invitations table
ALTER TABLE public.user_invitations 
ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_invitations_org_id ON public.user_invitations(organization_id);

-- Add Maddie to Moxie organization
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '3957f18c-8c70-4c63-8b9f-75c91a42064a',
  'user'
)
ON CONFLICT (organization_id, user_id) DO NOTHING;