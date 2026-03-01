
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Role,
  Permission,
  RoleSystemState,
  RolePermissionJoin,
} from '@/types/permissions';
import {
  DEFAULT_ADMIN_ROLE,
  DEFAULT_USER_ROLE,
  ADMIN_PERMISSION_OBJECTS,
  DEFAULT_USER_PERMISSION_OBJECTS,
} from '@/types/permissions';

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
          userRole: DEFAULT_ADMIN_ROLE,
          permissions: ADMIN_PERMISSION_OBJECTS,
          loading: false,
          error: null
        });
        return;
      }

      // Try new role system with explicit column hints
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role:role_id!user_roles_role_id_fkey(
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
        // Expected when user_roles table has restrictive RLS - silently fall back
        setState({
          userRole: DEFAULT_USER_ROLE,
          permissions: DEFAULT_USER_PERMISSION_OBJECTS,
          loading: false,
          error: null
        });
        return;
      }

      if (userRoles && userRoles.length > 0 && userRoles[0].role) {
        // Type the role properly - use unknown first for Supabase complex joins
        const roleData = userRoles[0].role as unknown as Role;
        
        // Fetch permissions for this role with explicit column hints
        const { data: rolePermissions } = await supabase
          .from('role_permissions')
          .select(`
            permission:permission_id!role_permissions_permission_id_fkey(
              key,
              name,
              description,
              category
            )
          `)
          .eq('role_id', roleData.id);

        const permissions: Permission[] = (rolePermissions || [])
          .map((rp) => (rp as unknown as RolePermissionJoin).permission)
          .filter((p): p is Permission => p !== null);

        setState({
          userRole: roleData,
          permissions,
          loading: false,
          error: null
        });
      } else {
        // Default to user role
        setState({
          userRole: DEFAULT_USER_ROLE,
          permissions: DEFAULT_USER_PERMISSION_OBJECTS,
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
    const adminByRole = state.userRole?.name === 'Admin';
    const adminByPermission = hasPermission('admin.access_panel');
    return adminByRole || adminByPermission;
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
