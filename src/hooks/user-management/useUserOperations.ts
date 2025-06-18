
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

export const useUserOperations = () => {
  const { user } = useAuth();

  const updateUserProfile = async (userId: string, updates: Partial<User>) => {
    try {
      // Update basic profile information
      const profileUpdates = { ...updates };
      delete profileUpdates.role; // Remove role from profile updates

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (profileError) {
          console.error('Error updating user profile:', profileError);
          toast({
            title: 'Error',
            description: 'Failed to update user profile',
            variant: 'destructive',
          });
          return false;
        }
      }

      // Handle role updates through the new system
      if (updates.role) {
        await updateUserRole(userId, updates.role);
      }

      toast({
        title: 'Success',
        description: 'User profile updated successfully',
      });
      
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
    try {
      // Get the role ID from the system_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('system_roles')
        .select('id')
        .eq('name', newRole)
        .single();

      if (roleError || !roleData) {
        console.error('Error finding role:', roleError);
        toast({
          title: 'Error',
          description: 'Role not found',
          variant: 'destructive',
        });
        return false;
      }

      // Remove existing roles for this user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Assign the new role
      const { error: assignError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_id: roleData.id,
          assigned_by: user?.id
        });

      if (assignError) {
        console.error('Error assigning role:', assignError);
        toast({
          title: 'Error',
          description: 'Failed to assign role',
          variant: 'destructive',
        });
        return false;
      }

      // Also update the legacy role field in profiles for backward compatibility
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      // Log the action
      await supabase
        .from('permission_audit_logs')
        .insert({
          action: 'user_role_changed',
          target_type: 'user',
          target_id: userId,
          performed_by: user?.id,
          details: { new_role: newRole }
        });

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
      
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

  const bulkUpdateUserRoles = async (userIds: string[], newRole: string) => {
    try {
      // Update each user's role
      const results = await Promise.all(
        userIds.map(userId => updateUserRole(userId, newRole))
      );

      const successCount = results.filter(Boolean).length;
      
      if (successCount === userIds.length) {
        toast({
          title: 'Success',
          description: `Updated ${successCount} users to ${newRole} role`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Updated ${successCount} of ${userIds.length} users`,
          variant: 'destructive',
        });
      }
      
      return successCount === userIds.length;
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

  return {
    updateUserProfile,
    updateUserRole,
    deleteUser,
    inviteUser,
    bulkUpdateUserRoles
  };
};
