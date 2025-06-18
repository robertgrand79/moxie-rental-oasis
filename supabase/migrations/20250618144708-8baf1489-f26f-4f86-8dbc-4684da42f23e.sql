
-- Create system_roles table for storing custom roles
CREATE TABLE public.system_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_permissions table for granular permission definitions
CREATE TABLE public.system_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create role_permissions junction table for flexible role-permission assignments
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.system_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.system_permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Create user_roles table for user-role assignments
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.system_roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Create permission_audit_logs table for tracking permission changes
CREATE TABLE public.permission_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'role', 'user', 'permission'
  target_id UUID NOT NULL,
  target_name TEXT,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.system_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for system_roles
CREATE POLICY "Admins can manage all roles" ON public.system_roles
  FOR ALL USING (public.is_admin());

-- Create RLS policies for system_permissions
CREATE POLICY "Admins can manage all permissions" ON public.system_permissions
  FOR ALL USING (public.is_admin());

-- Create RLS policies for role_permissions
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (public.is_admin());

-- Create RLS policies for user_roles
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for permission_audit_logs
CREATE POLICY "Admins can view all permission audit logs" ON public.permission_audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can create permission audit logs" ON public.permission_audit_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- Create indexes for better performance
CREATE INDEX idx_system_roles_name ON public.system_roles(name);
CREATE INDEX idx_system_roles_active ON public.system_roles(is_active);
CREATE INDEX idx_system_permissions_key ON public.system_permissions(key);
CREATE INDEX idx_system_permissions_category ON public.system_permissions(category);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX idx_user_roles_active ON public.user_roles(is_active);
CREATE INDEX idx_permission_audit_logs_target ON public.permission_audit_logs(target_type, target_id);
CREATE INDEX idx_permission_audit_logs_performed_by ON public.permission_audit_logs(performed_by);
CREATE INDEX idx_permission_audit_logs_created_at ON public.permission_audit_logs(created_at);

-- Create updated_at triggers
CREATE TRIGGER update_system_roles_updated_at
  BEFORE UPDATE ON public.system_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_permissions_updated_at
  BEFORE UPDATE ON public.system_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create helper functions for permission checking
CREATE OR REPLACE FUNCTION public.user_has_permission(user_id UUID, permission_key TEXT)
RETURNS BOOLEAN
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

CREATE OR REPLACE FUNCTION public.user_has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN
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

-- Insert default system permissions
INSERT INTO public.system_permissions (key, name, description, category) VALUES
-- User Management
('users.create', 'Create Users', 'Ability to invite and create new users', 'User Management'),
('users.read', 'View Users', 'Ability to view user information', 'User Management'),
('users.update', 'Edit Users', 'Ability to edit user profiles and information', 'User Management'),
('users.delete', 'Delete Users', 'Ability to delete user accounts', 'User Management'),
('users.manage_roles', 'Manage User Roles', 'Ability to assign and modify user roles', 'User Management'),

-- Content Management
('content.create', 'Create Content', 'Ability to create new content (blog posts, pages)', 'Content Management'),
('content.read', 'View Content', 'Ability to view content', 'Content Management'),
('content.update', 'Edit Content', 'Ability to edit existing content', 'Content Management'),
('content.delete', 'Delete Content', 'Ability to delete content', 'Content Management'),
('content.publish', 'Publish Content', 'Ability to publish and unpublish content', 'Content Management'),

-- Property Management
('properties.create', 'Create Properties', 'Ability to add new properties', 'Property Management'),
('properties.read', 'View Properties', 'Ability to view property information', 'Property Management'),
('properties.update', 'Edit Properties', 'Ability to edit property details', 'Property Management'),
('properties.delete', 'Delete Properties', 'Ability to remove properties', 'Property Management'),
('properties.manage_bookings', 'Manage Bookings', 'Ability to manage property bookings', 'Property Management'),

-- System Administration
('admin.access_panel', 'Access Admin Panel', 'Ability to access the administration interface', 'System Administration'),
('admin.manage_settings', 'Manage Settings', 'Ability to configure system settings', 'System Administration'),
('admin.view_logs', 'View System Logs', 'Ability to view system and audit logs', 'System Administration'),
('admin.manage_roles', 'Manage Roles', 'Ability to create and manage system roles', 'System Administration'),
('admin.manage_permissions', 'Manage Permissions', 'Ability to configure permissions', 'System Administration'),

-- Reports & Analytics
('reports.view', 'View Reports', 'Ability to view system reports and analytics', 'Reports & Analytics'),
('reports.export', 'Export Data', 'Ability to export data and reports', 'Reports & Analytics'),
('analytics.view', 'View Analytics', 'Ability to view detailed analytics', 'Reports & Analytics');

-- Insert default system roles
INSERT INTO public.system_roles (name, description, is_system_role) VALUES
('Super Admin', 'Full system access with all permissions', true),
('Admin', 'Administrative access with most permissions', true),
('Editor', 'Content management and basic administrative functions', true),
('User', 'Basic user access with limited permissions', true);

-- Get role IDs for permission assignments
DO $$
DECLARE
    super_admin_id UUID;
    admin_id UUID;
    editor_id UUID;
    user_id UUID;
BEGIN
    SELECT id INTO super_admin_id FROM public.system_roles WHERE name = 'Super Admin';
    SELECT id INTO admin_id FROM public.system_roles WHERE name = 'Admin';
    SELECT id INTO editor_id FROM public.system_roles WHERE name = 'Editor';
    SELECT id INTO user_id FROM public.system_roles WHERE name = 'User';

    -- Super Admin gets all permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT super_admin_id, id FROM public.system_permissions;

    -- Admin gets most permissions (excluding some super admin functions)
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT admin_id, id FROM public.system_permissions 
    WHERE key NOT IN ('admin.manage_roles', 'admin.manage_permissions');

    -- Editor gets content and basic permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT editor_id, id FROM public.system_permissions 
    WHERE key IN (
        'content.create', 'content.read', 'content.update', 'content.publish',
        'properties.read', 'properties.update',
        'admin.access_panel',
        'reports.view'
    );

    -- User gets basic read permissions
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT user_id, id FROM public.system_permissions 
    WHERE key IN ('content.read', 'properties.read');
END $$;
