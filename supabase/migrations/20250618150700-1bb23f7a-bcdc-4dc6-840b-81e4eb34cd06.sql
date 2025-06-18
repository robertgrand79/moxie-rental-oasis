
-- Phase 1: Fix Database Role System
-- First, let's ensure we have the basic system roles populated and migrate existing users

-- Check if system roles exist and insert them if they don't
INSERT INTO public.system_roles (name, description, is_system_role) 
VALUES 
  ('Super Admin', 'Full system access with all permissions', true),
  ('Admin', 'Administrative access with most permissions', true),
  ('Editor', 'Content management and basic administrative functions', true),
  ('User', 'Basic user access with limited permissions', true)
ON CONFLICT (name) DO NOTHING;

-- Get the role IDs we just created/confirmed exist
DO $$
DECLARE
    admin_role_id UUID;
    user_role_id UUID;
    super_admin_role_id UUID;
    editor_role_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO super_admin_role_id FROM public.system_roles WHERE name = 'Super Admin';
    SELECT id INTO admin_role_id FROM public.system_roles WHERE name = 'Admin';
    SELECT id INTO editor_role_id FROM public.system_roles WHERE name = 'Editor';
    SELECT id INTO user_role_id FROM public.system_roles WHERE name = 'User';

    -- Migrate existing users from profiles.role to user_roles table
    -- For users with 'admin' role in profiles
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, assigned_at)
    SELECT 
        p.id,
        admin_role_id,
        NULL, -- system migration
        now()
    FROM public.profiles p 
    WHERE p.role = 'admin'
    AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p.id AND ur.role_id = admin_role_id
    );

    -- For users with 'user' role in profiles
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, assigned_at)
    SELECT 
        p.id,
        user_role_id,
        NULL, -- system migration
        now()
    FROM public.profiles p 
    WHERE p.role = 'user'
    AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p.id AND ur.role_id = user_role_id
    );

    -- For any users without a role or with other roles, default to 'user'
    INSERT INTO public.user_roles (user_id, role_id, assigned_by, assigned_at)
    SELECT 
        p.id,
        user_role_id,
        NULL, -- system migration
        now()
    FROM public.profiles p 
    WHERE (p.role IS NULL OR p.role NOT IN ('admin', 'user'))
    AND NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = p.id
    );

END $$;

-- Assign basic permissions to roles if they don't exist
-- Super Admin gets all permissions
INSERT INTO public.role_permissions (role_id, permission_id, granted_by)
SELECT sr.id, sp.id, NULL
FROM public.system_roles sr
CROSS JOIN public.system_permissions sp
WHERE sr.name = 'Super Admin'
AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role_id = sr.id AND rp.permission_id = sp.id
);

-- Admin gets most permissions (excluding super admin specific ones)
INSERT INTO public.role_permissions (role_id, permission_id, granted_by)
SELECT sr.id, sp.id, NULL
FROM public.system_roles sr
CROSS JOIN public.system_permissions sp
WHERE sr.name = 'Admin'
AND sp.key NOT IN ('admin.manage_roles', 'admin.manage_permissions')
AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role_id = sr.id AND rp.permission_id = sp.id
);

-- User gets basic read permissions
INSERT INTO public.role_permissions (role_id, permission_id, granted_by)
SELECT sr.id, sp.id, NULL
FROM public.system_roles sr
CROSS JOIN public.system_permissions sp
WHERE sr.name = 'User'
AND sp.key IN ('content.read', 'properties.read')
AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role_id = sr.id AND rp.permission_id = sp.id
);
