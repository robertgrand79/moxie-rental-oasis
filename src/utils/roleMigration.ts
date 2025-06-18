
import { supabase } from '@/integrations/supabase/client';

export const migrateExistingUsersToNewRoleSystem = async () => {
  try {
    console.log('Starting user role migration...');

    // Get all users with their current roles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, role')
      .neq('role', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return false;
    }

    // Get system roles mapping
    const { data: systemRoles, error: rolesError } = await supabase
      .from('system_roles')
      .select('id, name');

    if (rolesError) {
      console.error('Error fetching system roles:', rolesError);
      return false;
    }

    const roleMapping = systemRoles.reduce((acc, role) => {
      acc[role.name.toLowerCase()] = role.id;
      return acc;
    }, {} as Record<string, string>);

    // Create user_roles entries for existing users
    const userRoles = users
      .filter(user => user.role && roleMapping[user.role.toLowerCase()])
      .map(user => ({
        user_id: user.id,
        role_id: roleMapping[user.role.toLowerCase()],
        assigned_by: null, // System migration
        assigned_at: new Date().toISOString()
      }));

    if (userRoles.length > 0) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .upsert(userRoles, { 
          onConflict: 'user_id,role_id',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Error inserting user roles:', insertError);
        return false;
      }

      console.log(`Migrated ${userRoles.length} users to new role system`);
    }

    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};
