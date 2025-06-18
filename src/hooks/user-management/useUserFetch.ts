
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

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: Array<{
    role: {
      name: string;
    };
  }>;
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
      
      // Check if current user is admin first
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

      // Fetch all users with their roles from the new system
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            role:system_roles(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
        return;
      }

      // Format users data to include role information from new system
      const formattedUsers = (data || []).map((userProfile: UserProfile) => {
        // Get the primary role (first active role) - access the name property correctly
        const userRoleData = userProfile.user_roles?.[0]?.role;
        const primaryRole = userRoleData?.name || userProfile.role || 'user';
        
        return {
          ...userProfile,
          role: primaryRole
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
