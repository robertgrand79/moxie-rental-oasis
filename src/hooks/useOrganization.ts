import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Organization, OrganizationMember } from '@/types/organizations';
import { useToast } from '@/hooks/use-toast';

export const useOrganization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Get user's organization membership
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('*, organization:organizations(*)')
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        if (memberError.code === 'PGRST116') {
          // No organization membership found
          setOrganization(null);
          setMembership(null);
        } else {
          throw memberError;
        }
      } else {
        setMembership(memberData as OrganizationMember);
        setOrganization(memberData.organization as Organization);
      }
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization');
      toast({
        title: 'Error',
        description: 'Failed to load organization data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganization();
  }, [user?.id]);

  const isOrgAdmin = () => {
    return membership?.role === 'admin' || membership?.role === 'owner';
  };

  const isOrgOwner = () => {
    return membership?.role === 'owner';
  };

  return {
    organization,
    membership,
    loading,
    error,
    refetch: fetchOrganization,
    isOrgAdmin,
    isOrgOwner,
  };
};
