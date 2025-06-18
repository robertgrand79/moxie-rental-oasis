
-- Add foreign key relationship between user_roles and profiles
ALTER TABLE user_roles 
ADD CONSTRAINT fk_user_roles_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add foreign key relationship between user_roles and system_roles
ALTER TABLE user_roles 
ADD CONSTRAINT fk_user_roles_role_id 
FOREIGN KEY (role_id) REFERENCES system_roles(id) ON DELETE CASCADE;

-- Add foreign key relationship between role_permissions and system_roles
ALTER TABLE role_permissions 
ADD CONSTRAINT fk_role_permissions_role_id 
FOREIGN KEY (role_id) REFERENCES system_roles(id) ON DELETE CASCADE;

-- Add foreign key relationship between role_permissions and system_permissions
ALTER TABLE role_permissions 
ADD CONSTRAINT fk_role_permissions_permission_id 
FOREIGN KEY (permission_id) REFERENCES system_permissions(id) ON DELETE CASCADE;

-- Ensure we have the basic system roles populated
INSERT INTO public.system_roles (name, description, is_system_role) 
VALUES 
  ('Super Admin', 'Full system access with all permissions', true),
  ('Admin', 'Administrative access with most permissions', true),
  ('Editor', 'Content management and basic administrative functions', true),
  ('User', 'Basic user access with limited permissions', true)
ON CONFLICT (name) DO NOTHING;

-- Migrate existing users from profiles.role to user_roles table
-- This ensures all existing users have roles in the new system
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

    -- Migrate users with 'admin' role in profiles
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

    -- Migrate users with 'user' role in profiles
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
