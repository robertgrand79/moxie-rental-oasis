import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Organization, OrganizationMember } from '@/types/organizations';
import { debug } from '@/utils/debug';

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
    // Return a safe default when used outside provider (e.g., in analytics hooks)
    // This prevents crashes for non-critical features like page tracking
    return {
      organization: null,
      membership: null,
      isPlatformAdmin: false,
      loading: true,
      error: null,
      isOrgAdmin: () => false,
      isOrgOwner: () => false,
      canManageOrganization: () => false,
      refetch: async () => {},
    };
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchOrganizationData = useCallback(async (isRetry = false) => {
    // Require both user AND session for RLS to work properly
    if (!user || !session) {
      debug.org('No user or session, clearing organization state');
      setOrganization(null);
      setMembership(null);
      setIsPlatformAdmin(false);
      setLoading(false);
      retryCountRef.current = 0;
      return;
    }

    // Prevent duplicate fetches
    if (isFetchingRef.current && !isRetry) {
      debug.org('Fetch already in progress, skipping');
      return;
    }

    isFetchingRef.current = true;

    try {
      setError(null);
      if (!isRetry) {
        setLoading(true);
      }

      // Small delay to let JWT token settle after session change
      if (!isRetry) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      debug.org('Fetching organization data for user:', user.email);

      // Fetch organization membership (most recent) and platform admin status in parallel
      const [membershipResult, platformAdminResult] = await Promise.all([
        supabase
          .from('organization_members')
          .select(`
            *,
            organization:organizations(*)
          `)
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('platform_admins')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()
      ]);

      if (membershipResult.error) {
        debug.error('Error fetching organization membership:', membershipResult.error);
        throw membershipResult.error;
      }

      if (platformAdminResult.error && platformAdminResult.error.code !== 'PGRST116') {
        debug.warn('Error fetching platform admin status:', platformAdminResult.error);
      }

      // Set organization and membership data
      if (membershipResult.data) {
        const memberData = membershipResult.data as any;
        debug.org('Organization found:', memberData.organization?.name);
        setMembership({
          id: memberData.id,
          organization_id: memberData.organization_id,
          user_id: memberData.user_id,
          role: memberData.role,
          invited_by: memberData.invited_by,
          joined_at: memberData.joined_at,
        });
        setOrganization(memberData.organization as Organization);
        retryCountRef.current = 0;
      } else {
        // No organization found - retry once if this is first attempt
        if (retryCountRef.current === 0 && !isRetry) {
          debug.warn('No organization found, will retry in 500ms...');
          retryCountRef.current = 1;
          isFetchingRef.current = false;
          setTimeout(() => fetchOrganizationData(true), 500);
          return;
        }
        
        debug.org('No organization membership found after retry');
        setMembership(null);
        setOrganization(null);
      }

      // Set platform admin status
      setIsPlatformAdmin(!!platformAdminResult.data);

    } catch (err) {
      debug.error('Error in fetchOrganizationData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization data');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    fetchOrganizationData();
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        debug.warn('Organization context loading timeout - forcing completion');
        setLoading(false);
      }
    }, 8000);
    
    return () => clearTimeout(timeout);
  }, [fetchOrganizationData]);

  // Ensure isOrgAdmin doesn't return false prematurely during loading
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
