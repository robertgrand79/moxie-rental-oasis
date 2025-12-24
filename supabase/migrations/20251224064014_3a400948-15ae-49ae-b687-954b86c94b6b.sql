-- Create platform_role enum if not exists
DO $$ BEGIN
  CREATE TYPE platform_role AS ENUM ('super_admin', 'support', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add permission levels to platform_admins
ALTER TABLE public.platform_admins 
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0;

-- Create platform admin audit log
CREATE TABLE IF NOT EXISTS public.platform_admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.platform_admins(id) ON DELETE SET NULL,
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL, -- login, impersonation_start, impersonation_end, org_update, user_update, etc.
  target_type text, -- organization, user, booking, etc.
  target_id uuid,
  target_name text,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  session_id text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view audit logs
CREATE POLICY "Platform admins can view audit logs"
ON public.platform_admin_audit_logs
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

-- System can insert logs
CREATE POLICY "System can insert audit logs"
ON public.platform_admin_audit_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_platform_admin_audit_logs_admin 
ON public.platform_admin_audit_logs(admin_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_admin_audit_logs_target 
ON public.platform_admin_audit_logs(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_platform_admin_audit_logs_action 
ON public.platform_admin_audit_logs(action_type, created_at DESC);

-- Create impersonation sessions table
CREATE TABLE IF NOT EXISTS public.admin_impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  is_active boolean DEFAULT true,
  actions_taken jsonb DEFAULT '[]',
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE public.admin_impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Platform admins can view all sessions
CREATE POLICY "Platform admins can view impersonation sessions"
ON public.admin_impersonation_sessions
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

-- Platform admins can create sessions
CREATE POLICY "Platform admins can create impersonation sessions"
ON public.admin_impersonation_sessions
FOR INSERT
WITH CHECK (public.is_platform_admin(auth.uid()));

-- Platform admins can update their own sessions
CREATE POLICY "Platform admins can update their sessions"
ON public.admin_impersonation_sessions
FOR UPDATE
USING (admin_user_id = auth.uid());

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_platform_admin_action(
  p_action_type text,
  p_target_type text DEFAULT NULL,
  p_target_id uuid DEFAULT NULL,
  p_target_name text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id uuid;
  v_log_id uuid;
BEGIN
  -- Get admin record
  SELECT id INTO v_admin_id
  FROM public.platform_admins
  WHERE user_id = auth.uid() AND is_active = true;
  
  -- Insert log entry
  INSERT INTO public.platform_admin_audit_logs (
    admin_id,
    admin_user_id,
    action_type,
    target_type,
    target_id,
    target_name,
    details
  ) VALUES (
    v_admin_id,
    auth.uid(),
    p_action_type,
    p_target_type,
    p_target_id,
    p_target_name,
    p_details
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;