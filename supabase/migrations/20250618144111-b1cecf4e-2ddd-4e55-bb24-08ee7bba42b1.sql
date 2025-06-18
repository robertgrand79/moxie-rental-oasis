
-- Create user_invitations table for tracking invitations
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_invitations
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_invitations
CREATE POLICY "Admins can manage all invitations" ON public.user_invitations
  FOR ALL USING (public.is_admin());

-- Create user_audit_logs table for tracking user management actions
CREATE TABLE public.user_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target_user_id UUID,
  target_user_email TEXT,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_audit_logs
ALTER TABLE public.user_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.user_audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can create audit logs" ON public.user_audit_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- Add indexes for better performance
CREATE INDEX idx_user_invitations_email ON public.user_invitations(email);
CREATE INDEX idx_user_invitations_token ON public.user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_expires_at ON public.user_invitations(expires_at);
CREATE INDEX idx_user_audit_logs_target_user ON public.user_audit_logs(target_user_id);
CREATE INDEX idx_user_audit_logs_performed_by ON public.user_audit_logs(performed_by);
CREATE INDEX idx_user_audit_logs_created_at ON public.user_audit_logs(created_at);

-- Add last_login_at and status columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Create updated_at trigger for user_invitations
CREATE TRIGGER update_user_invitations_updated_at
  BEFORE UPDATE ON public.user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
