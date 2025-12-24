-- Create team role enum
DO $$ BEGIN
  CREATE TYPE public.team_role AS ENUM ('owner', 'manager', 'staff', 'view_only');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add team_role column to organization_members if it doesn't exist
DO $$ BEGIN
  ALTER TABLE public.organization_members ADD COLUMN team_role public.team_role DEFAULT 'staff';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Migrate existing roles to team_role
UPDATE public.organization_members 
SET team_role = CASE 
  WHEN role = 'owner' THEN 'owner'::public.team_role
  WHEN role IN ('admin', 'administrator') THEN 'manager'::public.team_role
  WHEN role = 'user' THEN 'staff'::public.team_role
  ELSE 'staff'::public.team_role
END
WHERE team_role IS NULL OR team_role = 'staff';

-- Update user_invitations table with additional fields
ALTER TABLE public.user_invitations 
ADD COLUMN IF NOT EXISTS team_role public.team_role DEFAULT 'staff',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS resent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS resend_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS inviter_name text,
ADD COLUMN IF NOT EXISTS organization_name text;

-- Create index for faster invitation lookups
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON public.user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_org_status ON public.user_invitations(organization_id, status);

-- Create team permissions table for granular permission overrides
CREATE TABLE IF NOT EXISTS public.team_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_role public.team_role NOT NULL,
  permission_key text NOT NULL,
  is_allowed boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_role, permission_key)
);

-- Enable RLS on team_permissions
ALTER TABLE public.team_permissions ENABLE ROW LEVEL SECURITY;

-- Create policy for team_permissions (only platform admins can manage)
CREATE POLICY "Platform admins can manage team permissions"
ON public.team_permissions FOR ALL
USING (is_platform_admin(auth.uid()));

CREATE POLICY "Authenticated users can view team permissions"
ON public.team_permissions FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Insert default permissions for each role based on the matrix
-- Owner: Full access to everything
INSERT INTO public.team_permissions (team_role, permission_key, is_allowed) VALUES
('owner', 'view_dashboard', true),
('owner', 'view_properties', true),
('owner', 'edit_properties', true),
('owner', 'add_delete_properties', true),
('owner', 'view_bookings', true),
('owner', 'manage_bookings', true),
('owner', 'view_guest_info', true),
('owner', 'respond_inquiries', true),
('owner', 'edit_site', true),
('owner', 'view_reports', true),
('owner', 'export_data', true),
('owner', 'manage_billing', true),
('owner', 'manage_team', true),
('owner', 'account_settings', true)
ON CONFLICT (team_role, permission_key) DO NOTHING;

-- Manager: Full access except billing and team management
INSERT INTO public.team_permissions (team_role, permission_key, is_allowed) VALUES
('manager', 'view_dashboard', true),
('manager', 'view_properties', true),
('manager', 'edit_properties', true),
('manager', 'add_delete_properties', true),
('manager', 'view_bookings', true),
('manager', 'manage_bookings', true),
('manager', 'view_guest_info', true),
('manager', 'respond_inquiries', true),
('manager', 'edit_site', true),
('manager', 'view_reports', true),
('manager', 'export_data', true),
('manager', 'manage_billing', false),
('manager', 'manage_team', false),
('manager', 'account_settings', true)
ON CONFLICT (team_role, permission_key) DO NOTHING;

-- Staff: Limited access
INSERT INTO public.team_permissions (team_role, permission_key, is_allowed) VALUES
('staff', 'view_dashboard', true),
('staff', 'view_properties', true),
('staff', 'edit_properties', true),
('staff', 'add_delete_properties', false),
('staff', 'view_bookings', true),
('staff', 'manage_bookings', true),
('staff', 'view_guest_info', true),
('staff', 'respond_inquiries', true),
('staff', 'edit_site', false),
('staff', 'view_reports', true),
('staff', 'export_data', false),
('staff', 'manage_billing', false),
('staff', 'manage_team', false),
('staff', 'account_settings', false)
ON CONFLICT (team_role, permission_key) DO NOTHING;

-- View Only: Read-only access
INSERT INTO public.team_permissions (team_role, permission_key, is_allowed) VALUES
('view_only', 'view_dashboard', true),
('view_only', 'view_properties', true),
('view_only', 'edit_properties', false),
('view_only', 'add_delete_properties', false),
('view_only', 'view_bookings', true),
('view_only', 'manage_bookings', false),
('view_only', 'view_guest_info', false),
('view_only', 'respond_inquiries', false),
('view_only', 'edit_site', false),
('view_only', 'view_reports', true),
('view_only', 'export_data', false),
('view_only', 'manage_billing', false),
('view_only', 'manage_team', false),
('view_only', 'account_settings', false)
ON CONFLICT (team_role, permission_key) DO NOTHING;

-- Create function to check team permission
CREATE OR REPLACE FUNCTION public.has_team_permission(
  _user_id uuid,
  _organization_id uuid,
  _permission_key text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members om
    JOIN team_permissions tp ON om.team_role = tp.team_role
    WHERE om.user_id = _user_id
      AND om.organization_id = _organization_id
      AND tp.permission_key = _permission_key
      AND tp.is_allowed = true
  )
$$;

-- Create function to get user's team role in an organization
CREATE OR REPLACE FUNCTION public.get_team_role(
  _user_id uuid,
  _organization_id uuid
)
RETURNS public.team_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_role
  FROM organization_members
  WHERE user_id = _user_id
    AND organization_id = _organization_id
  LIMIT 1
$$;

-- Create activity log for team actions
CREATE TABLE IF NOT EXISTS public.team_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on team_activity_log
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_activity_log
CREATE POLICY "Organization members can view activity log"
ON public.team_activity_log FOR SELECT
USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "Authenticated users can insert activity log"
ON public.team_activity_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for team activity log
CREATE INDEX IF NOT EXISTS idx_team_activity_log_org ON public.team_activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_log_user ON public.team_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_log_created ON public.team_activity_log(created_at DESC);