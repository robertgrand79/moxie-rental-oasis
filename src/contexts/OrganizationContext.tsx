import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Organization, OrganizationMember } from '@/types/organizations';

interface OrganizationContextType {
  organization: Organization | null;
  membership: OrganizationMember | null;
  isPlatformAdmin: boolean;
  loading: boolean;
  error: string | null;
  isOrgAdmin: () => boolean;
  isOrgOwner: () => boolean;
  canManageOrganization: () => boolean;
  refetch: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useCurrentOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useCurrentOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizationData = useCallback(async () => {
    if (!user) {
      setOrganization(null);
      setMembership(null);
      setIsPlatformAdmin(false);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      // Fetch organization membership and platform admin status in parallel
      const [membershipResult, platformAdminResult] = await Promise.all([
        supabase
          .from('organization_members')
          .select(`
            *,
            organization:organizations(*)
          `)
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('platform_admins')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()
      ]);

      if (membershipResult.error) {
        console.error('Error fetching organization membership:', membershipResult.error);
        throw membershipResult.error;
      }

      if (platformAdminResult.error && platformAdminResult.error.code !== 'PGRST116') {
        console.error('Error fetching platform admin status:', platformAdminResult.error);
      }

      // Set organization and membership data
      if (membershipResult.data) {
        const memberData = membershipResult.data as any;
        setMembership({
          id: memberData.id,
          organization_id: memberData.organization_id,
          user_id: memberData.user_id,
          role: memberData.role,
          invited_by: memberData.invited_by,
          joined_at: memberData.joined_at,
        });
        setOrganization(memberData.organization as Organization);
      } else {
        setMembership(null);
        setOrganization(null);
      }

      // Set platform admin status
      setIsPlatformAdmin(!!platformAdminResult.data);

    } catch (err) {
      console.error('Error in fetchOrganizationData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizationData();
  }, [fetchOrganizationData]);

  const isOrgAdmin = useCallback(() => {
    return membership?.role === 'admin' || membership?.role === 'owner' || isPlatformAdmin;
  }, [membership, isPlatformAdmin]);

  const isOrgOwner = useCallback(() => {
    return membership?.role === 'owner' || isPlatformAdmin;
  }, [membership, isPlatformAdmin]);

  const canManageOrganization = useCallback(() => {
    return isOrgOwner() || isPlatformAdmin;
  }, [isOrgOwner, isPlatformAdmin]);

  const value: OrganizationContextType = {
    organization,
    membership,
    isPlatformAdmin,
    loading,
    error,
    isOrgAdmin,
    isOrgOwner,
    canManageOrganization,
    refetch: fetchOrganizationData,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
