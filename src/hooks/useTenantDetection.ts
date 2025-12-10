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

// Debug logging helper
const logTenant = (message: string, data?: any) => {
  const prefix = '🏢 [TenantDetection]';
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

/**
 * Detects the current tenant based on:
 * 1. URL query param (?org=slug)
 * 2. Custom domain (e.g., moxievacationrentals.com)
 * 3. User's organization membership (if logged in)
 * 4. Falls back to primary template organization for preview/development
 */
export const useTenantDetection = (): TenantDetectionResult => {
  const location = useLocation();
  const pathname = location.pathname;
  
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDefaultTenant, setIsDefaultTenant] = useState(false);
  
  const wasAdminRoute = useRef(pathname.startsWith('/admin'));
  const forceRedetect = useRef(false);
  const hasInitialized = useRef(false);

  const isAdminRoute = useMemo(() => {
    return pathname.startsWith('/admin');
  }, [pathname]);

  // Reset tenant state when transitioning between admin and public routes
  useEffect(() => {
    const currentlyAdmin = pathname.startsWith('/admin');
    
    if (wasAdminRoute.current !== currentlyAdmin) {
      logTenant('Route transition:', wasAdminRoute.current ? 'admin → public' : 'public → admin');
      setTenant(null);
      setLoading(true);
      sessionStorage.removeItem('current_tenant_slug');
      wasAdminRoute.current = currentlyAdmin;
      hasInitialized.current = false; // Reset to allow re-detection
    }
  }, [pathname]);

  // Detect tenant identifier from URL
  const detectedIdentifier = useMemo(() => {
    if (isAdminRoute) {
      logTenant('Admin route - skipping URL-based detection');
      return null;
    }

    // Check for ?org= query parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const orgSlug = urlParams.get('org');
    if (orgSlug) {
      logTenant('Tenant from ?org= param:', orgSlug);
      return orgSlug;
    }

    const hostname = window.location.hostname;
    const PLATFORM_DOMAIN = 'staymoxie.com';
    
    // Check for subdomain of staymoxie.com (e.g., moxie.staymoxie.com)
    if (hostname.endsWith(`.${PLATFORM_DOMAIN}`)) {
      const subdomain = hostname.replace(`.${PLATFORM_DOMAIN}`, '');
      if (subdomain && subdomain !== 'www') {
        logTenant('Tenant from subdomain:', subdomain);
        return subdomain; // Returns slug to match against organizations.slug
      }
    }
    
    // Check if it's a custom domain (not staymoxie.com, not Lovable, not localhost)
    if (!hostname.includes('lovable.app') && 
        !hostname.includes('localhost') && 
        !hostname.includes('127.0.0.1') &&
        hostname !== PLATFORM_DOMAIN &&
        hostname !== `www.${PLATFORM_DOMAIN}`) {
      const cleanHostname = hostname.replace(/^www\./, '');
      logTenant('Tenant from custom domain:', cleanHostname);
      return cleanHostname;
    }
    
    // On Lovable preview or localhost - no explicit tenant identifier
    logTenant('No explicit tenant in URL (hostname:', hostname + ')');
    return null;
  }, [isAdminRoute]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        logTenant('User signed out - triggering re-detection');
        sessionStorage.removeItem('current_tenant_slug');
        forceRedetect.current = true;
        setLoading(true);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Skip if already initialized and no force redetect needed
    if (hasInitialized.current && !forceRedetect.current) {
      return;
    }
    
    // Mark as initialized and reset force flag
    hasInitialized.current = true;
    forceRedetect.current = false;
    let isMounted = true;
    
    const fetchTenant = async () => {
      try {
        // Ensure loading is true at start of detection
        if (!loading) {
          setLoading(true);
        }
        setError(null);
        logTenant('Starting tenant detection...');

        // Strategy 1: Use explicit identifier from URL (slug or custom_domain)
        if (detectedIdentifier) {
          logTenant('Trying URL identifier:', detectedIdentifier);
          
          // Use RPC function to bypass RLS for public tenant lookups
          const { data, error: fetchError } = await supabase
            .rpc('get_organization_by_identifier', { _identifier: detectedIdentifier });

          if (fetchError) {
            logTenant('URL identifier lookup error:', fetchError.message);
          }

          // RPC returns array, get first result
          const orgData = Array.isArray(data) ? data[0] : data;
          
          if (orgData && isMounted) {
            logTenant('✅ Tenant resolved from URL:', { id: orgData.id, name: orgData.name, slug: orgData.slug });
            sessionStorage.setItem('current_tenant_slug', orgData.slug);
            setTenant(orgData as TenantInfo);
            setIsDefaultTenant(false);
            setLoading(false);
            return;
          } else {
            logTenant('URL identifier not found in database');
          }
        }

        // Strategy 2: Check logged-in user's organization (with timeout)
        if (!isAdminRoute) {
          logTenant('Trying user organization membership...');
          
          const userOrgPromise = (async (): Promise<TenantInfo | null> => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                logTenant('User authenticated:', user.id);
                
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
              logTenant('User org lookup error:', err);
              return null;
            }
          })();

          const userOrg = await Promise.race([
            userOrgPromise,
            new Promise<null>((resolve) => setTimeout(() => {
              logTenant('User org lookup timeout (3s)');
              resolve(null);
            }, 3000))
          ]);

          if (userOrg && isMounted) {
            logTenant('✅ Tenant resolved from user membership:', { id: userOrg.id, name: userOrg.name, slug: userOrg.slug });
            sessionStorage.setItem('current_tenant_slug', userOrg.slug);
            setTenant(userOrg);
            setIsDefaultTenant(false);
            setLoading(false);
            return;
          }
        }

        // On admin routes, stop here
        if (isAdminRoute) {
          logTenant('Admin route - no fallback, OrganizationContext will handle');
          if (isMounted) {
            setTenant(null);
            setIsDefaultTenant(false);
            setLoading(false);
          }
          return;
        }

        // Strategy 3: Fallback to primary template organization for preview/development
        // This ensures the public site works on Lovable preview without requiring login
        logTenant('Trying fallback to primary template organization...');
        
        // Use RPC function to bypass RLS for public template lookup
        const { data: templateData, error: templateError } = await supabase
          .rpc('get_primary_template_organization');

        if (templateError) {
          logTenant('Template org lookup error:', templateError.message);
        }

        // RPC returns array, get first result
        const templateOrg = Array.isArray(templateData) ? templateData[0] : templateData;

        if (templateOrg && isMounted) {
          logTenant('✅ Tenant resolved from template fallback:', { id: templateOrg.id, name: templateOrg.name, slug: templateOrg.slug });
          setTenant(templateOrg as TenantInfo);
          setIsDefaultTenant(true);
          setLoading(false);
          return;
        }

        // No tenant found at all
        logTenant('⚠️ No tenant could be resolved');
        if (isMounted) {
          setTenant(null);
          setIsDefaultTenant(false);
          setLoading(false);
        }

      } catch (err) {
        logTenant('Detection error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        logTenant('⚠️ Safety timeout reached (8s), forcing load complete');
        setLoading(false);
      }
    }, 8000);

    fetchTenant();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [detectedIdentifier, isAdminRoute]);

  // Log current state for debugging
  useEffect(() => {
    if (!loading) {
      logTenant('Current state:', {
        tenantId: tenant?.id ?? 'none',
        tenantName: tenant?.name ?? 'none',
        tenantSlug: tenant?.slug ?? 'none',
        isDefaultTenant,
        detectedIdentifier: detectedIdentifier ?? 'none'
      });
    }
  }, [tenant, loading, isDefaultTenant, detectedIdentifier]);

  return {
    tenant,
    loading,
    error,
    isDefaultTenant,
    detectedIdentifier,
  };
};
