
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

const DEFAULT_LOGO_SETTINGS = {
  siteName: 'Moxie Vacation Rentals',
  logoUrl: '/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png'
};

const LogoSection = () => {
  const { tenantId, tenant } = useTenant();

  // Fetch logo settings from database scoped by tenant
  const { data: logoSettings } = useQuery({
    queryKey: ['logo-settings', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['siteName', 'logoUrl']);

      // Filter by tenant if available
      if (tenantId) {
        query = query.eq('organization_id', tenantId);
      }

      const { data, error } = await query;

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

      // Use tenant info as additional fallback
      const finalSettings = {
        ...DEFAULT_LOGO_SETTINGS,
        siteName: settingsMap.siteName || tenant?.name || DEFAULT_LOGO_SETTINGS.siteName,
        logoUrl: settingsMap.logoUrl || tenant?.logo_url || DEFAULT_LOGO_SETTINGS.logoUrl
      };

      return finalSettings;
    },
    staleTime: 30000
  });

  // Use fetched settings or fallback to defaults
  const currentSettings = logoSettings || DEFAULT_LOGO_SETTINGS;

  return (
    <div className="flex items-center">
      <Link to="/" className="flex items-center">
        <img 
          src={currentSettings.logoUrl} 
          alt={currentSettings.siteName} 
          className="h-10 w-auto"
        />
      </Link>
    </div>
  );
};

export default LogoSection;
