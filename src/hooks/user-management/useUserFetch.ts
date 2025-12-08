import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  organization_role?: string; // Role within the organization (owner, admin, member)
}

export const useUserFetch = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { organization, isOrgAdmin, isPlatformAdmin } = useCurrentOrganization();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user has admin access (org admin or platform admin)
      if (!isOrgAdmin() && !isPlatformAdmin) {
        setError('Access denied: Admin privileges required');
        setUsers([]);
        return;
      }

      // If no organization context, return empty
      if (!organization?.id) {
        setUsers([]);
        return;
      }

      // Fetch organization members with their profiles
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          id,
          role,
          joined_at,
          profile:profiles(
            id,
            email,
            full_name,
            role,
            status,
            last_login_at,
            created_at,
            updated_at
          )
        `)
        .eq('organization_id', organization.id)
        .order('joined_at', { ascending: false });

      if (membersError) {
        console.error('Error fetching organization members:', membersError);
        setError(membersError.message);
        return;
      }

      // Format users data with organization role
      const formattedUsers: User[] = (members || [])
        .filter(member => member.profile) // Filter out members without profiles
        .map((member: any) => ({
          id: member.profile.id,
          email: member.profile.email,
          full_name: member.profile.full_name,
          role: member.profile.role || 'user',
          status: member.profile.status || 'active',
          last_login_at: member.profile.last_login_at,
          created_at: member.profile.created_at,
          updated_at: member.profile.updated_at,
          organization_role: member.role, // owner, admin, or member
        }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Unexpected error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [user, organization?.id, isOrgAdmin, isPlatformAdmin]);

  const searchUsers = useCallback((query: string) => {
    if (!query.trim()) {
      return users;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return users.filter(user => 
      user.email.toLowerCase().includes(lowercaseQuery) ||
      (user.full_name && user.full_name.toLowerCase().includes(lowercaseQuery)) ||
      user.role.toLowerCase().includes(lowercaseQuery) ||
      (user.organization_role && user.organization_role.toLowerCase().includes(lowercaseQuery))
    );
  }, [users]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    searchUsers,
    setUsers
  };
};
