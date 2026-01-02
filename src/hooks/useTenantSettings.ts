import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { debug } from '@/utils/debug';
import { acquireTenantSettingsChannel } from '@/hooks/tenantSettingsRealtime';
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
  // About page settings
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImageUrl?: string;
  founderNames?: string;
  missionStatement?: string;
  missionDescription?: string;
  // Location settings
  heroLocationText?: string;
  // Home page section settings
  propertiesSectionTitle?: string;
  propertiesSectionDescription?: string;
  testimonialsSectionDescription?: string;
  amenitiesSectionDescription?: string;
  lifestyleSectionTitle?: string;
  lifestyleSectionDescription?: string;
  finalFeatureSectionTitle?: string;
  finalFeature1Title?: string;
  finalFeature1Description?: string;
  finalFeature2Title?: string;
  finalFeature2Description?: string;
  finalFeature3Title?: string;
  finalFeature3Description?: string;
  newsletterTitle?: string;
  newsletterDescription?: string;
  // Color settings (for public pages)
  colorPrimary?: string;
  colorSecondary?: string;
  colorAccent?: string;
  colorBackground?: string;
  colorForeground?: string;
  colorMuted?: string;
  colorDestructive?: string;
  colorUseGradients?: string;
  [key: string]: string | undefined;
}

/**
 * Hook to fetch site settings for the current tenant.
 * Transforms key/value rows into a settings object.
 * Includes realtime subscription for live updates.
 */
export const useTenantSettings = () => {
  const { tenantId, tenant, loading: tenantLoading } = useTenant();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tenant-settings', tenantId],
    queryFn: async (): Promise<TenantSettings> => {
      if (!tenantId) {
        debug.settings('No tenantId, returning empty settings');
        return {};
      }

      debug.settings('Fetching settings for org:', tenantId, tenant?.name);

      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', tenantId);

      if (error) {
        debug.error('[TenantSettings] Error:', error.message);
        throw error;
      }

      // Transform key/value rows into object
      const settings: TenantSettings = {};
      if (data) {
        data.forEach((row) => {
          settings[row.key] = row.value as string;
        });
      }

      debug.settings('Loaded', data?.length ?? 0, 'settings');
      return settings;
    },
    enabled: !!tenantId && !tenantLoading,
    staleTime: 5 * 60 * 1000,
  });

  // Realtime subscription for live updates (shared per-tenant)
  // Use ref to prevent duplicate acquisitions on re-renders
  const channelAcquiredRef = useRef(false);
  const currentTenantRef = useRef<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    
    // Only acquire if tenant changed or not yet acquired
    if (channelAcquiredRef.current && currentTenantRef.current === tenantId) {
      return;
    }
    
    channelAcquiredRef.current = true;
    currentTenantRef.current = tenantId;
    
    const release = acquireTenantSettingsChannel(tenantId, queryClient);
    
    return () => {
      channelAcquiredRef.current = false;
      currentTenantRef.current = null;
      release();
    };
  }, [tenantId, queryClient]);


  // Merge tenant info with settings - look for both camelCase and snake_case keys
  // siteLogo is the key used by LogoUploader, so check it first
  const mergedSettings: TenantSettings = {
    ...query.data,
    // Use tenant logo if no site-specific logo (check siteLogo first as that's what LogoUploader saves)
    logo_url: query.data?.siteLogo || query.data?.logo_url || query.data?.logoUrl || tenant?.logo_url || undefined,
    // Use site name from settings or tenant name (check both key formats)
    site_name: query.data?.site_name || query.data?.siteName || tenant?.name || undefined,
  };
  
  debug.settings('Logo resolved:', mergedSettings.logo_url ? 'Found' : 'Not configured');

  return {
    settings: mergedSettings,
    loading: tenantLoading || query.isLoading,
    error: query.error?.message ?? null,
  };
};
