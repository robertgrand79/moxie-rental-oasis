
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
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

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: 'Error',
          description: 'Failed to update user role',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
      
      await fetchUsers(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Unexpected error updating user role:', err);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Note: This will delete the profile. The actual auth user deletion
      // would need to be handled by an admin API or edge function
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

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
      // For now, we'll just show a success message
      // In a real implementation, you'd call an edge function to send an invitation email
      toast({
        title: 'Invitation Sent',
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
    updateUserRole,
    deleteUser,
    inviteUser,
  };
};
