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
  team_role?: string; // Granular team role (owner, manager, staff, maintenance, cleaner, view_only)
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

      // Fetch organization members
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select('id, user_id, role, team_role, joined_at')
        .eq('organization_id', organization.id)
        .order('joined_at', { ascending: false });

      if (membersError) {
        console.error('Error fetching organization members:', membersError);
        setError(membersError.message);
        return;
      }

      if (!members || members.length === 0) {
        setUsers([]);
        return;
      }

      // Get user IDs from members
      const userIds = members.map(m => m.user_id).filter(Boolean);

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, status, last_login_at, created_at, updated_at')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setError(profilesError.message);
        return;
      }

      // Create a map of profiles by ID
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Format users data with organization role
      const formattedUsers: User[] = members
        .filter(member => profileMap.has(member.user_id))
        .map((member) => {
          const profile = profileMap.get(member.user_id)!;
          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role || 'user',
            status: profile.status || 'active',
            last_login_at: profile.last_login_at,
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            organization_role: member.role,
            team_role: member.team_role || undefined,
          };
        });

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
