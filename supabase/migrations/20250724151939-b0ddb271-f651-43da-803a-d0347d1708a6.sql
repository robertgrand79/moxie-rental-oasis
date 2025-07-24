-- CRITICAL SECURITY FIXES - Phase 1: Privilege Escalation Prevention

-- 1. Remove dangerous overly permissive RLS policies on profiles table
DROP POLICY IF EXISTS "authenticated_users_update_all" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_delete_all" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_insert_all" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_users_select_all" ON public.profiles;

-- 2. Create proper role change security function
CREATE OR REPLACE FUNCTION public.can_update_user_role(target_user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can update roles, and they cannot demote themselves
  RETURN public.is_admin() AND (target_user_id != auth.uid() OR new_role = 'admin');
END;
$$;

-- 3. Create secure profile update policy that prevents role self-modification
CREATE POLICY "Users can securely update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (
    -- If role is being changed, user must have permission
    (OLD.role IS DISTINCT FROM NEW.role AND public.can_update_user_role(id, NEW.role)) OR
    -- If role is not being changed, allow update
    (OLD.role = NEW.role)
  )
);

-- 4. Fix database function security paths
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.system_roles sr ON ur.role_id = sr.id
    WHERE ur.user_id = user_has_role.user_id
    AND sr.name = role_name
    AND ur.is_active = true
    AND sr.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_permission(user_id uuid, permission_key text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role_id = rp.role_id
    JOIN public.system_permissions sp ON rp.permission_id = sp.id
    JOIN public.system_roles sr ON ur.role_id = sr.id
    WHERE ur.user_id = user_has_permission.user_id
    AND sp.key = permission_key
    AND ur.is_active = true
    AND sr.is_active = true
    AND sp.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > now())
  );
END;
$$;

-- 5. Fix newsletter campaigns policy to use consistent admin check
DROP POLICY IF EXISTS "Admins can manage all campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins can manage all campaigns" 
ON public.newsletter_campaigns 
FOR ALL 
USING (public.is_admin());

-- 6. Create role change audit trigger
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log role changes for security monitoring
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.permission_audit_logs (
      action,
      target_type,
      target_id,
      target_name,
      performed_by,
      details
    ) VALUES (
      'role_changed',
      'user',
      NEW.id,
      NEW.full_name,
      auth.uid(),
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role change auditing
DROP TRIGGER IF EXISTS audit_profile_role_changes ON public.profiles;
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();