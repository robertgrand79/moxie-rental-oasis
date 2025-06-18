
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPermissions {
  [key: string]: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserPermissions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // First check if user is admin using legacy system
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // If user is admin, give them all permissions
      if (profile?.role === 'admin') {
        setPermissions({
          'users.create': true,
          'users.read': true,
          'users.update': true,
          'users.delete': true,
          'users.manage_roles': true,
          'admin.access_panel': true,
          'admin.manage_settings': true,
          'admin.view_logs': true,
          'admin.manage_roles': true,
          'admin.manage_permissions': true,
          'content.create': true,
          'content.read': true,
          'content.update': true,
          'content.delete': true,
          'content.publish': true,
          'properties.create': true,
          'properties.read': true,
          'properties.update': true,
          'properties.delete': true,
          'properties.manage_bookings': true,
          'reports.view': true,
          'reports.export': true,
          'analytics.view': true
        });
        return;
      }

      // Try to fetch permissions through the new role system with explicit column hints
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            role:role_id(
              role_permissions(
                permission:permission_id(*)
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (!error && data?.length > 0) {
          // Build permissions object from new system
          const userPermissions: UserPermissions = {};
          
          data.forEach((userRole) => {
            const role = userRole.role as any;
            const rolePermissions = role?.role_permissions || [];
            rolePermissions.forEach((rp: any) => {
              if (rp.permission?.key) {
                userPermissions[rp.permission.key] = true;
              }
            });
          });

          setPermissions(userPermissions);
          return;
        }
      } catch (newSystemError) {
        console.warn('New permission system not available:', newSystemError);
      }

      // Fallback: basic permissions for regular users
      setPermissions({
        'content.read': true,
        'properties.read': true
      });

    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions({});
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  const hasPermission = useCallback((permission: string): boolean => {
    return permissions[permission] === true;
  }, [permissions]);

  const hasAnyPermission = useCallback((permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  }, [hasPermission]);

  return {
    permissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch: fetchUserPermissions
  };
};
