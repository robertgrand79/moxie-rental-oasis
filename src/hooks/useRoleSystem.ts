
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UserRole {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
}

interface UserPermission {
  key: string;
  name: string;
  description: string;
  category: string;
}

interface RoleSystemState {
  userRole: UserRole | null;
  permissions: UserPermission[];
  loading: boolean;
  error: string | null;
}

export const useRoleSystem = () => {
  const [state, setState] = useState<RoleSystemState>({
    userRole: null,
    permissions: [],
    loading: true,
    error: null
  });
  
  const { user } = useAuth();

  const fetchUserRoleAndPermissions = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, loading: false, userRole: null, permissions: [] }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // First check legacy admin system
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // If user is admin in legacy system, give them admin access
      if (profile?.role === 'admin') {
        setState({
          userRole: {
            id: 'admin',
            name: 'Admin',
            description: 'Full administrative access',
            is_system_role: true
          },
          permissions: [
            { key: 'admin.access_panel', name: 'Access Admin Panel', description: 'Access admin interface', category: 'Administration' },
            { key: 'users.manage_roles', name: 'Manage Users', description: 'Manage user accounts', category: 'User Management' },
            { key: 'content.create', name: 'Create Content', description: 'Create content', category: 'Content Management' },
            { key: 'properties.create', name: 'Create Properties', description: 'Create properties', category: 'Property Management' }
          ],
          loading: false,
          error: null
        });
        return;
      }

      // Try new role system with explicit column hints
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role:role_id(
            id,
            name,
            description,
            is_system_role
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (rolesError) {
        console.warn('New role system not available, falling back to default user role');
        setState({
          userRole: {
            id: 'user',
            name: 'User',
            description: 'Basic user access',
            is_system_role: true
          },
          permissions: [
            { key: 'content.read', name: 'View Content', description: 'View content', category: 'Content' },
            { key: 'properties.read', name: 'View Properties', description: 'View properties', category: 'Properties' }
          ],
          loading: false,
          error: null
        });
        return;
      }

      if (userRoles && userRoles.length > 0 && userRoles[0].role) {
        const role = userRoles[0].role as any;
        
        // Fetch permissions for this role with explicit column hints
        const { data: rolePermissions } = await supabase
          .from('role_permissions')
          .select(`
            permission:permission_id(
              key,
              name,
              description,
              category
            )
          `)
          .eq('role_id', role.id);

        const permissions = rolePermissions?.map(rp => (rp.permission as any)).filter(Boolean) || [];

        setState({
          userRole: role,
          permissions,
          loading: false,
          error: null
        });
      } else {
        // Default to user role
        setState({
          userRole: {
            id: 'user',
            name: 'User',
            description: 'Basic user access',
            is_system_role: true
          },
          permissions: [
            { key: 'content.read', name: 'View Content', description: 'View content', category: 'Content' },
            { key: 'properties.read', name: 'View Properties', description: 'View properties', category: 'Properties' }
          ],
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching user role and permissions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load user permissions'
      }));
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserRoleAndPermissions();
  }, [fetchUserRoleAndPermissions]);

  const hasPermission = useCallback((permission: string): boolean => {
    return state.permissions.some(p => p.key === permission);
  }, [state.permissions]);

  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const isAdmin = useCallback((): boolean => {
    return state.userRole?.name === 'Admin' || hasPermission('admin.access_panel');
  }, [state.userRole, hasPermission]);

  return {
    userRole: state.userRole,
    permissions: state.permissions,
    loading: state.loading,
    error: state.error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    refetch: fetchUserRoleAndPermissions
  };
};
