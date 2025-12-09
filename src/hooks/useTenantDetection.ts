import { useState, useEffect, useMemo } from 'react';
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
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDefaultTenant, setIsDefaultTenant] = useState(false);
  const [pathname, setPathname] = useState(window.location.pathname);

  // Track pathname changes
  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  // Check if we're on an admin route - admin routes should use OrganizationContext instead
  const isAdminRoute = useMemo(() => {
    return pathname.startsWith('/admin');
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
      return orgSlug;
    }

    const hostname = window.location.hostname;
    
    // Check if it's a custom domain (not lovable.app or localhost)
    if (!hostname.includes('lovable.app') && 
        !hostname.includes('localhost') && 
        !hostname.includes('127.0.0.1')) {
      // It's a custom domain - use the full hostname
      return hostname;
    }
    
    // Check for subdomain on lovable.app
    if (hostname.includes('lovable.app')) {
      const parts = hostname.split('.');
      // Format: subdomain.lovable.app or project-id.lovable.app
      if (parts.length >= 3) {
        const subdomain = parts[0];
        // Skip if it's the main project subdomain (contains project ID pattern)
        if (subdomain.length < 20) {
          return subdomain;
        }
      }
    }
    
    // No specific tenant detected - will use default
    return null;
  }, [isAdminRoute]);

  useEffect(() => {
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

        // Fallback for public routes: Get the default/first active organization
        const { data: defaultOrg, error: defaultError } = await supabase
          .from('organizations')
          .select('id, name, slug, logo_url, website, custom_domain, is_active, template_type')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!isMounted) return;

        if (defaultError) {
          console.error('Error fetching default tenant:', defaultError);
          setError('Failed to load tenant information');
        } else if (defaultOrg) {
          setTenant(defaultOrg as TenantInfo);
          setIsDefaultTenant(true);
        } else {
          setError('No active organizations found');
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
  }, [detectedIdentifier, isAdminRoute]);

  return {
    tenant,
    loading,
    error,
    isDefaultTenant,
    detectedIdentifier,
  };
};
