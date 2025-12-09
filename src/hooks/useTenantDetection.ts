import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  custom_domain: string | null;
  is_active: boolean;
  template_type: 'single_property' | 'multi_property' | null;
}

interface TenantDetectionResult {
  tenant: TenantInfo | null;
  loading: boolean;
  error: string | null;
  isDefaultTenant: boolean;
  detectedIdentifier: string | null;
}

/**
 * Detects the current tenant based on:
 * 1. Custom domain (e.g., moxievacationrentals.com)
 * 2. Subdomain (e.g., moxie.lovable.app)
 * 3. Defaults to the first active organization if none detected
 */
export const useTenantDetection = (): TenantDetectionResult => {
  const location = useLocation(); // React Router hook - updates on every navigation
  const pathname = location.pathname;
  
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDefaultTenant, setIsDefaultTenant] = useState(false);
  
  // Track previous admin route state to detect transitions
  const wasAdminRoute = useRef(pathname.startsWith('/admin'));
  
  // Track force re-detection after logout
  const forceRedetect = useRef(false);

  // Check if we're on an admin route - admin routes should use OrganizationContext instead
  const isAdminRoute = useMemo(() => {
    return pathname.startsWith('/admin');
  }, [pathname]);

  // Reset tenant state when transitioning between admin and public routes
  useEffect(() => {
    const currentlyAdmin = pathname.startsWith('/admin');
    
    if (wasAdminRoute.current !== currentlyAdmin) {
      console.log('🔄 Route transition detected:', wasAdminRoute.current ? 'admin → public' : 'public → admin');
      
      // Clear tenant state to force re-detection
      setTenant(null);
      setLoading(true);
      sessionStorage.removeItem('current_tenant_slug');
      
      wasAdminRoute.current = currentlyAdmin;
    }
  }, [pathname]);

  // Detect tenant identifier from URL
  const detectedIdentifier = useMemo(() => {
    // On admin routes, don't detect tenant from URL - let OrganizationContext handle it
    if (isAdminRoute) {
      return null;
    }

    // Check for org query parameter first (used by "Back to Site" button)
    const urlParams = new URLSearchParams(window.location.search);
    const orgSlug = urlParams.get('org');
    if (orgSlug) {
      console.log('🏷️ Tenant from URL param:', orgSlug);
      return orgSlug;
    }

    const hostname = window.location.hostname;
    
    // Check if it's a custom domain (not lovable.app or localhost)
    if (!hostname.includes('lovable.app') && 
        !hostname.includes('localhost') && 
        !hostname.includes('127.0.0.1')) {
      // It's a custom domain - strip www. prefix for consistent DB matching
      const cleanHostname = hostname.replace(/^www\./, '');
      console.log('🏷️ Tenant from custom domain:', cleanHostname);
      return cleanHostname;
    }
    
    // On Lovable preview or localhost WITHOUT explicit tenant - this is platform site
    // Return null to indicate no tenant (platform site will handle it)
    console.log('🌐 No explicit tenant detected - platform site mode');
    return null;
  }, [isAdminRoute]);

  // Listen for auth state changes to trigger re-detection when user logs out
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        console.log('🔄 User signed out, triggering tenant re-detection from domain');
        sessionStorage.removeItem('current_tenant_slug');
        // Set flag to force re-detection, then trigger loading state
        // This ensures we re-detect from custom_domain instead of clearing tenant
        forceRedetect.current = true;
        setLoading(true);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Skip if not loading and no force flag
    if (!loading && !forceRedetect.current) {
      return;
    }
    
    // Clear force flag
    forceRedetect.current = false;
    
    let isMounted = true;
    
    const fetchTenant = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try: Use detected identifier from URL
        if (detectedIdentifier) {
          const { data, error: fetchError } = await supabase
            .from('organizations')
            .select('id, name, slug, logo_url, website, custom_domain, is_active, template_type')
            .or(`slug.eq.${detectedIdentifier},custom_domain.eq.${detectedIdentifier}`)
            .eq('is_active', true)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching tenant:', fetchError);
          }

          if (data && isMounted) {
            sessionStorage.setItem('current_tenant_slug', data.slug);
            setTenant(data as TenantInfo);
            setIsDefaultTenant(false);
            setLoading(false);
            return;
          }
        }

        // Try user organization with a 3-second timeout to prevent hanging
        if (!isAdminRoute) {
          const userOrgPromise = (async (): Promise<TenantInfo | null> => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { data: membership } = await supabase
                  .from('organization_members')
                  .select('organization:organizations(id, name, slug, logo_url, website, custom_domain, is_active, template_type)')
                  .eq('user_id', user.id)
                  .order('joined_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (membership?.organization) {
                  const orgData = membership.organization as unknown as TenantInfo;
                  if (orgData.is_active) {
                    return orgData;
                  }
                }
              }
              return null;
            } catch (err) {
              console.warn('Error checking user organization:', err);
              return null;
            }
          })();

          // Race between user org detection and a 3-second timeout
          const userOrg = await Promise.race([
            userOrgPromise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
          ]);

          if (userOrg && isMounted) {
            sessionStorage.setItem('current_tenant_slug', userOrg.slug);
            setTenant(userOrg);
            setIsDefaultTenant(false);
            setLoading(false);
            return;
          }
        }

        // On admin routes, don't fallback to any organization - let OrganizationContext handle it
        if (isAdminRoute) {
          if (isMounted) {
            setTenant(null);
            setIsDefaultTenant(false);
            setLoading(false);
          }
          return;
        }

        // No explicit tenant detected and no user organization found
        // This means we're on the platform site - don't fallback to first org
        // The PlatformContext will handle showing platform content
        console.log('📭 No tenant detected - platform site will handle display');
        if (isMounted) {
          setTenant(null);
          setIsDefaultTenant(false);
          setLoading(false);
        }

      } catch (err) {
        console.error('Error in tenant detection:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Overall safety timeout - ensure loading never stays stuck forever
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Tenant detection safety timeout reached, forcing load complete');
        setLoading(false);
      }
    }, 8000);

    fetchTenant();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [detectedIdentifier, isAdminRoute, loading]);

  return {
    tenant,
    loading,
    error,
    isDefaultTenant,
    detectedIdentifier,
  };
};
