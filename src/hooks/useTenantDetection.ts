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

  // Check if we're on an admin route - admin routes should use OrganizationContext instead
  const isAdminRoute = useMemo(() => {
    return window.location.pathname.startsWith('/admin');
  }, []);

  // Detect tenant identifier from URL
  const detectedIdentifier = useMemo(() => {
    // On admin routes, don't detect tenant from URL - let OrganizationContext handle it
    if (isAdminRoute) {
      return null;
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
    const fetchTenant = async () => {
      try {
        setLoading(true);
        setError(null);

        if (detectedIdentifier) {
          // Try to find organization by slug or custom domain
          const { data, error: fetchError } = await supabase
            .from('organizations')
            .select('id, name, slug, logo_url, website, custom_domain, is_active')
            .or(`slug.eq.${detectedIdentifier},custom_domain.eq.${detectedIdentifier}`)
            .eq('is_active', true)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching tenant:', fetchError);
          }

          if (data) {
            setTenant(data as TenantInfo);
            setIsDefaultTenant(false);
            setLoading(false);
            return;
          }
        }

        // On admin routes, don't fallback to any organization - let OrganizationContext handle it
        if (isAdminRoute) {
          setTenant(null);
          setIsDefaultTenant(false);
          setLoading(false);
          return;
        }

        // Fallback for public routes: Get the default/first active organization
        const { data: defaultOrg, error: defaultError } = await supabase
          .from('organizations')
          .select('id, name, slug, logo_url, website, custom_domain, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

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
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [detectedIdentifier, isAdminRoute]);

  return {
    tenant,
    loading,
    error,
    isDefaultTenant,
    detectedIdentifier,
  };
};
