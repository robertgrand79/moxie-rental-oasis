import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

// Generic defaults - no hardcoded brand references
const DEFAULT_LOGO_SETTINGS = {
  siteName: 'Vacation Rentals',
  logoUrl: ''
};

const LogoSection = () => {
  const { tenantId, tenant, loading: tenantLoading } = useTenant();

  // Fetch logo settings from database scoped by tenant - query both camelCase and snake_case keys
  const { data: logoSettings } = useQuery({
    queryKey: ['logo-settings', tenantId],
    queryFn: async () => {
      if (!tenantId) {
        return DEFAULT_LOGO_SETTINGS;
      }

      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', tenantId)
        .in('key', ['siteName', 'site_name', 'logoUrl', 'logo_url', 'siteLogo']);

      if (error) {
        console.error('Error fetching logo settings:', error);
        return DEFAULT_LOGO_SETTINGS;
      }

      // Convert array to object
      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      // Normalize keys - check camelCase, snake_case, and siteLogo, use tenant info as fallback
      const finalSettings = {
        siteName: settingsMap.siteName || settingsMap.site_name || tenant?.name || DEFAULT_LOGO_SETTINGS.siteName,
        logoUrl: settingsMap.siteLogo || settingsMap.logoUrl || settingsMap.logo_url || tenant?.logo_url || DEFAULT_LOGO_SETTINGS.logoUrl
      };
      
      console.log('🖼️ [LogoSection] Logo settings resolved:', finalSettings);

      return finalSettings;
    },
    enabled: !tenantLoading,
    staleTime: 30000
  });

  // Use fetched settings or fallback to defaults
  const currentSettings = logoSettings || {
    siteName: tenant?.name || DEFAULT_LOGO_SETTINGS.siteName,
    logoUrl: tenant?.logo_url || DEFAULT_LOGO_SETTINGS.logoUrl
  };

  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center">
        {currentSettings.logoUrl ? (
          <img 
            src={currentSettings.logoUrl} 
            alt={currentSettings.siteName} 
            className="h-10 w-auto"
          />
        ) : (
          <span className="text-xl font-bold text-foreground">
            {currentSettings.siteName}
          </span>
        )}
      </Link>
    </div>
  );
};

export default LogoSection;
