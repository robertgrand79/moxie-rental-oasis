import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { usePlatform } from './PlatformContext';
import { Organization, OrganizationMember, ORGANIZATION_SAFE_SELECT } from '@/types/organizations';
import { debug } from '@/utils/debug';

interface OrganizationContextType {
  organization: Organization | null;
  membership: OrganizationMember | null;
  isPlatformAdmin: boolean;
  isPlatformMode: boolean;
  loading: boolean;
  error: string | null;
  isOrgAdmin: () => boolean;
  isOrgOwner: () => boolean;
  canManageOrganization: () => boolean;
  refetch: () => Promise<void>;
  switchOrganization: (orgId: string) => Promise<boolean>;
  enterPlatformMode: () => void;
  enterTenantMode: (orgId: string) => Promise<boolean>;
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
      isPlatformMode: false,
      loading: true,
      error: null,
      isOrgAdmin: () => false,
      isOrgOwner: () => false,
      canManageOrganization: () => false,
      refetch: async () => {},
      switchOrganization: async () => false,
      enterPlatformMode: () => {},
      enterTenantMode: async () => false,
    };
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const { isPlatformAdminDomain } = usePlatform();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMember | null>(null);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isPlatformMode, setIsPlatformMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const isFetchingRef = useRef(false);
  
  // Track the user ID we've successfully fetched for
  // This prevents refetching on navigation when user hasn't changed
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);
  
  // Check if we're on a neutral domain (Lovable, localhost)
  const isNeutralDomain = useCallback(() => {
    const hostname = window.location.hostname;
    return hostname.includes('lovable.app') || 
           hostname.includes('localhost') || 
           hostname.includes('127.0.0.1');
  }, []);

  const fetchOrganizationData = useCallback(async (isRetry = false, forceRefetch = false) => {
    // Require both user AND session for RLS to work properly
    if (!user || !session) {
      debug.org('No user or session, clearing organization state');
      setOrganization(null);
      setMembership(null);
      setIsPlatformAdmin(false);
      setLoading(false);
      retryCountRef.current = 0;
      lastFetchedUserIdRef.current = null;
      hasInitializedRef.current = false;
      return;
    }

    // Skip fetch if we already have data for this user (navigation cache)
    // Only refetch if user changed, forced, or this is a retry
    if (
      hasInitializedRef.current &&
      lastFetchedUserIdRef.current === user.id &&
      organization &&
      !forceRefetch &&
      !isRetry
    ) {
      debug.org('Using cached organization data for navigation');
      setLoading(false);
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
      if (!isRetry && !hasInitializedRef.current) {
        setLoading(true);
      }

      // Small delay to let JWT token settle after session change (only on first load)
      if (!isRetry && !hasInitializedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      debug.org('Fetching organization data for user:', user.email);

      // Detect which organization to select based on current domain
      const hostname = window.location.hostname.replace(/^www\./, '');
      const PLATFORM_DOMAIN = 'staymoxie.com';
      let domainOrgSlug: string | null = null;
      let domainCustomDomain: string | null = null;
      
      // Check for subdomain (e.g., moxie.staymoxie.com)
      if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
        domainOrgSlug = hostname.replace(`.${PLATFORM_DOMAIN}`, '');
        debug.org('Detected subdomain org slug:', domainOrgSlug);
      } 
      // Check for custom domain (not staymoxie.com, not localhost, not lovable)
      else if (!hostname.includes('lovable.app') && 
               !hostname.includes('localhost') && 
               !hostname.includes('127.0.0.1') &&
               hostname !== PLATFORM_DOMAIN) {
        domainCustomDomain = hostname;
        debug.org('Detected custom domain:', domainCustomDomain);
      }

      // Fetch ALL organization memberships and platform admin status in parallel
      const [membershipResult, platformAdminResult] = await Promise.all([
        supabase
          .from('organization_members')
          .select(`
            *,
            organization:organizations(${ORGANIZATION_SAFE_SELECT})
          `)
          .eq('user_id', user.id)
          .order('joined_at', { ascending: true }), // Oldest first (primary)
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

      // Set organization and membership data - prioritize domain matching
      const memberships = membershipResult.data as any[];
      
      if (memberships && memberships.length > 0) {
        let selectedMember: any = null;
        
        // Priority 1: Match by custom domain
        if (domainCustomDomain) {
          selectedMember = memberships.find((m: any) => 
            m.organization?.custom_domain?.replace(/^www\./, '') === domainCustomDomain
          );
          if (selectedMember) {
            debug.org('Organization matched by custom domain:', selectedMember.organization?.name);
          }
        }
        
        // Priority 2: Match by subdomain slug
        if (!selectedMember && domainOrgSlug) {
          selectedMember = memberships.find((m: any) => 
            m.organization?.slug === domainOrgSlug
          );
          if (selectedMember) {
            debug.org('Organization matched by subdomain:', selectedMember.organization?.name);
          }
        }
        
        // Priority 3: Fall back to oldest (primary) organization
        if (!selectedMember) {
          selectedMember = memberships[0]; // Already sorted oldest first
          debug.org('Using primary (oldest) organization:', selectedMember.organization?.name);
        }
        
        setMembership({
          id: selectedMember.id,
          organization_id: selectedMember.organization_id,
          user_id: selectedMember.user_id,
          role: selectedMember.role,
          invited_by: selectedMember.invited_by,
          joined_at: selectedMember.joined_at,
        });
        setOrganization(selectedMember.organization as Organization);
        retryCountRef.current = 0;
        lastFetchedUserIdRef.current = user.id;
        hasInitializedRef.current = true;
        
        // Always persist the resolved org slug so public pages can pick it up
        if (selectedMember.organization?.slug) {
          sessionStorage.setItem('admin_current_org_slug', selectedMember.organization.slug);
          sessionStorage.setItem('current_tenant_slug', selectedMember.organization.slug);
          debug.org('Persisted admin org context on init:', selectedMember.organization.slug);
        }
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
        lastFetchedUserIdRef.current = user.id;
        hasInitializedRef.current = true;
      }

      // Set platform admin status
      const isPlatAdmin = !!platformAdminResult.data;
      setIsPlatformAdmin(isPlatAdmin);
      
      // Auto-enter platform mode for platform admins on:
      // 1. admin.staymoxie.com (dedicated platform admin domain)
      // 2. Neutral domains (localhost, lovable.app) with no org context
      if (isPlatAdmin && (isPlatformAdminDomain || (isNeutralDomain() && !organization))) {
        debug.org('Platform admin on platform/neutral domain - entering platform mode');
        setIsPlatformMode(true);
      }

    } catch (err) {
      debug.error('Error in fetchOrganizationData:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organization data');
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [user, session, organization, isPlatformAdminDomain]);

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

  // Platform admin function to switch to any organization
  const switchOrganization = useCallback(async (orgId: string): Promise<boolean> => {
    if (!user || !isPlatformAdmin) {
      debug.error('switchOrganization: User not authenticated or not platform admin');
      return false;
    }

    try {
      debug.org('Platform admin switching to organization:', orgId);
      
      // Fetch the target organization
      const { data: targetOrg, error: orgError } = await supabase
        .from('organizations')
        .select(ORGANIZATION_SAFE_SELECT)
        .eq('id', orgId)
        .single();

      if (orgError || !targetOrg) {
        debug.error('Failed to fetch target organization:', orgError);
        return false;
      }

      // Check if already a member
      const { data: existingMembership } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', orgId)
        .maybeSingle();

      if (!existingMembership) {
        // Add platform admin as owner of this org temporarily
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            user_id: user.id,
            organization_id: orgId,
            role: 'owner',
            invited_by: user.id,
          });

        if (memberError) {
          debug.error('Failed to add platform admin to organization:', memberError);
          return false;
        }
      }

      // Log impersonation session to admin_impersonation_sessions
      await supabase
        .from('admin_impersonation_sessions')
        .insert([{
          admin_user_id: user.id,
          target_organization_id: orgId,
          target_user_id: null,
          started_at: new Date().toISOString(),
          is_active: true,
          user_agent: navigator?.userAgent || null,
        }]);

      // Log to platform admin audit logs
      const { data: adminRecord } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      await supabase
        .from('platform_admin_audit_logs')
        .insert([{
          admin_user_id: user.id,
          admin_id: adminRecord?.id || user.id,
          action_type: 'impersonation_start',
          target_type: 'organization',
          target_id: orgId,
          target_name: targetOrg.name,
          details: { started_at: new Date().toISOString() },
          user_agent: navigator?.userAgent || null,
        }]);

      // Update local state immediately
      setOrganization(targetOrg as unknown as Organization);
      setMembership({
        id: existingMembership?.id || 'temp',
        organization_id: orgId,
        user_id: user.id,
        role: 'owner',
        invited_by: user.id,
        joined_at: new Date().toISOString(),
      });
      
      // Persist the switched org slug for public page synchronization
      sessionStorage.setItem('admin_current_org_slug', targetOrg.slug);
      sessionStorage.setItem('current_tenant_slug', targetOrg.slug);
      debug.org('Persisted admin org context:', targetOrg.slug);

      debug.org('Successfully switched to organization:', targetOrg.name);
      setIsPlatformMode(false); // Exit platform mode when viewing a tenant
      return true;
    } catch (err) {
      debug.error('Error switching organization:', err);
      return false;
    }
  }, [user, isPlatformAdmin]);

  // Enter platform mode (no tenant context)
  const enterPlatformMode = useCallback(() => {
    debug.org('Entering platform mode');
    setIsPlatformMode(true);
    setOrganization(null);
    setMembership(null);
    // Clear persisted org context when entering platform mode
    sessionStorage.removeItem('admin_current_org_slug');
  }, []);

  // Enter tenant mode (switch to a specific org)
  const enterTenantMode = useCallback(async (orgId: string): Promise<boolean> => {
    setIsPlatformMode(false);
    return switchOrganization(orgId);
  }, [switchOrganization]);

  // Force refetch function for explicit refresh needs
  const refetch = useCallback(async () => {
    await fetchOrganizationData(false, true);
  }, [fetchOrganizationData]);

  const value: OrganizationContextType = {
    organization,
    membership,
    isPlatformAdmin,
    isPlatformMode,
    loading,
    error,
    isOrgAdmin,
    isOrgOwner,
    canManageOrganization,
    refetch,
    switchOrganization,
    enterPlatformMode,
    enterTenantMode,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
