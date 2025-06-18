
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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

interface UserInvitation {
  email: string;
  role: string;
  full_name?: string;
}

export const useUserManagement = () => {
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

      // Fetch all users (RLS will handle access control)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to update user profile',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Success',
        description: 'User profile updated successfully',
      });
      
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Unexpected error updating user profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user profile',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    return await updateUserProfile(userId, { role: newRole });
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Unexpected error deleting user:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
      return false;
    }
  };

  const inviteUser = async (invitation: UserInvitation) => {
    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: invitation
      });

      if (error) {
        console.error('Error inviting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to send invitation',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Success',
        description: `Invitation sent to ${invitation.email}`,
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected error inviting user:', err);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
      return false;
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

  const bulkUpdateUserRoles = async (userIds: string[], newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .in('id', userIds);

      if (error) {
        console.error('Error bulk updating user roles:', error);
        toast({
          title: 'Error',
          description: 'Failed to update user roles',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Success',
        description: `Updated ${userIds.length} users to ${newRole} role`,
      });
      
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Unexpected error bulk updating user roles:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user roles',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserProfile,
    updateUserRole,
    deleteUser,
    inviteUser,
    searchUsers,
    bulkUpdateUserRoles,
  };
};
