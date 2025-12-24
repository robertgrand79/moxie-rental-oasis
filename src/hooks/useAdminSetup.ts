
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { debug } from '@/utils/debug';

export const useAdminSetup = () => {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const { user } = useAuth();

  const setupAdminAccess = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'No authenticated user found. Please log in first.',
        variant: 'destructive'
      });
      return false;
    }

    setIsSettingUp(true);
    try {
      debug.auth('Setting up admin access for user:', user.id);

      // First, ensure the user has a profile with admin role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          role: 'admin',
          status: 'active',
          last_login_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        debug.error('Profile setup error:', profileError);
        throw profileError;
      }

      // Try to set up new role system if it exists
      try {
        // Get admin role ID
        const { data: adminRole, error: roleError } = await supabase
          .from('system_roles')
          .select('id')
          .eq('name', 'Admin')
          .single();

        if (!roleError && adminRole) {
          // Check if user already has admin role
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('id')
            .eq('user_id', user.id)
            .eq('role_id', adminRole.id)
            .eq('is_active', true)
            .single();

          if (!existingRole) {
            // Assign admin role
            const { error: userRoleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: user.id,
                role_id: adminRole.id,
                assigned_by: user.id,
                is_active: true
              });

            if (userRoleError) {
              debug.warn('Could not assign new role system admin:', userRoleError);
              // Don't throw error - legacy system should still work
            }
          }
        }
      } catch (newRoleError) {
        debug.warn('New role system not available:', newRoleError);
        // Continue with legacy system
      }

      debug.auth('Admin access setup complete');
      
      toast({
        title: 'Success',
        description: 'Admin access has been configured successfully!',
      });

      return true;
    } catch (error) {
      debug.error('Error setting up admin access:', error);
      toast({
        title: 'Setup Failed',
        description: 'Failed to set up admin access. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSettingUp(false);
    }
  };

  return {
    setupAdminAccess,
    isSettingUp
  };
};
