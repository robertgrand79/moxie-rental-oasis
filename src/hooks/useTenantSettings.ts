import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface TenantSettings {
  site_name?: string;
  site_description?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  footer_text?: string;
  // Blog settings
  blogTitle?: string;
  blogDescription?: string;
  [key: string]: string | undefined;
}

/**
 * Hook to fetch site settings for the current tenant.
 * Transforms key/value rows into a settings object.
 */
export const useTenantSettings = () => {
  const { tenantId, tenant, loading: tenantLoading } = useTenant();

  const query = useQuery({
    queryKey: ['tenant-settings', tenantId],
    queryFn: async (): Promise<TenantSettings> => {
      if (!tenantId) return {};

      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', tenantId);

      if (error) {
        console.error('Error fetching tenant settings:', error);
        throw error;
      }

      // Transform key/value rows into object
      const settings: TenantSettings = {};
      if (data) {
        data.forEach((row) => {
          settings[row.key] = row.value as string;
        });
      }

      return settings;
    },
    enabled: !!tenantId && !tenantLoading,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Merge tenant info with settings
  const mergedSettings: TenantSettings = {
    ...query.data,
    // Use tenant logo if no site-specific logo
    logo_url: query.data?.logo_url || tenant?.logo_url || undefined,
    site_name: query.data?.site_name || tenant?.name || undefined,
  };

  return {
    settings: mergedSettings,
    loading: tenantLoading || query.isLoading,
    error: query.error?.message ?? null,
  };
};
