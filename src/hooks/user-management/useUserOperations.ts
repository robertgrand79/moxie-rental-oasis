
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useUserOperations = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const updateUserProfile = async (userId: string, updates: any) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User profile updated successfully',
      });

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user profile',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true);

      // Update legacy role system first
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Try to update new role system if it exists
      try {
        // Get the role ID for the new role
        const { data: roleData, error: roleError } = await supabase
          .from('system_roles')
          .select('id')
          .eq('name', newRole === 'admin' ? 'Admin' : 'User')
          .single();

        if (!roleError && roleData) {
          // Remove existing roles
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId);

          // Add new role
          await supabase
            .from('user_roles')
            .insert({
              user_id: userId,
              role_id: roleData.id,
              assigned_by: user?.id
            });
        }
      } catch (newRoleError) {
        console.warn('Could not update new role system:', newRoleError);
        // Continue - legacy system update succeeded
      }

      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setLoading(true);
      
      // Use the edge function for actual deletion
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const inviteUser = async (invitation: { email: string; role: string; full_name?: string }) => {
    try {
      setLoading(true);

      const invitationToken = crypto.randomUUID();

      // Create invitation record
      const { data: invitationData, error: inviteError } = await supabase
        .from('user_invitations')
        .insert({
          email: invitation.email,
          role: invitation.role,
          full_name: invitation.full_name,
          invited_by: user?.id,
          invitation_token: invitationToken
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: invitation.email,
          full_name: invitation.full_name,
          role: invitation.role,
          invitedBy: user?.id,
          invitationToken: invitationToken
        }
      });

      if (emailError) {
        console.warn('Failed to send invitation email:', emailError);
        toast({
          title: 'Partial Success',
          description: `Invitation created for ${invitation.email}, but email failed to send. The user can still be invited manually.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `Invitation email sent to ${invitation.email}`,
        });
      }

      return true;
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateUserRoles = async (userIds: string[], newRole: string) => {
    try {
      setLoading(true);
      
      // Update multiple users
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .in('id', userIds);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Updated ${userIds.length} users to ${newRole} role`,
      });

      return true;
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user roles',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateUserProfile,
    updateUserRole,
    deleteUser,
    deactivateUser,
    inviteUser,
    bulkUpdateUserRoles,
    loading
  };
};
