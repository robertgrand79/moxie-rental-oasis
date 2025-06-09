
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserPermissions, defaultPermissions } from './useUserPermissions';

export const usePermissionCheck = () => {
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, permissions')
            .eq('id', user.id)
            .single();

          if (profile) {
            setUserRole(profile.role);
            // Safely handle the permissions object
            const permissions = profile.permissions as Record<string, any> || {};
            const mergedPermissions = { ...defaultPermissions, ...permissions };
            setUserPermissions(mergedPermissions as UserPermissions);
          }
        }
      } catch (error) {
        console.error('Error fetching user permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPermissions();
  }, []);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (userRole === 'admin') return true;
    return userPermissions?.[permission] || false;
  };

  const hasAnyPermission = (permissions: (keyof UserPermissions)[]): boolean => {
    if (userRole === 'admin') return true;
    return permissions.some(permission => userPermissions?.[permission] || false);
  };

  return {
    userPermissions,
    userRole,
    loading,
    hasPermission,
    hasAnyPermission,
    isAdmin: userRole === 'admin',
  };
};
