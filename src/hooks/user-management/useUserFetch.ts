
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserFetch = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if current user is admin first using legacy system
      const { data: currentUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error('Error checking user role:', profileError);
        setError('Failed to verify admin access');
        return;
      }

      if (currentUserProfile?.role !== 'admin') {
        setError('Access denied: Admin privileges required');
        return;
      }

      // First try to fetch users with new role system
      const { data: usersWithNewRoles, error: newRoleError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!fk_user_roles_user_id(
            role:system_roles!user_roles_role_id_fkey(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (newRoleError) {
        console.warn('New role system query failed, falling back to legacy:', newRoleError);
        
        // Fallback to legacy role system
        const { data: legacyUsers, error: legacyError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (legacyError) {
          console.error('Error fetching users with legacy system:', legacyError);
          setError(legacyError.message);
          return;
        }

        // Format legacy users
        const formattedLegacyUsers = (legacyUsers || []).map((userProfile: any) => ({
          ...userProfile,
          role: userProfile.role || 'user'
        }));

        setUsers(formattedLegacyUsers);
        return;
      }

      // Format users data to include role information from new system
      const formattedUsers = (usersWithNewRoles || []).map((userProfile: any) => {
        // Try to get role from new system first, fallback to legacy
        const newSystemRole = userProfile.user_roles?.[0]?.role?.name;
        const finalRole = newSystemRole || userProfile.role || 'user';
        
        return {
          ...userProfile,
          role: finalRole
        };
      });

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = (query: string) => {
    if (!query.trim()) {
      return users;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(lowercaseQuery) ||
      (user.full_name && user.full_name.toLowerCase().includes(lowercaseQuery)) ||
      user.role.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    searchUsers,
    setUsers
  };
};
