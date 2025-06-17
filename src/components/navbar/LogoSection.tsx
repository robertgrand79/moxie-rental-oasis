
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_LOGO_SETTINGS = {
  siteName: 'Moxie Vacation Rentals',
  logoUrl: '/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png'
};

const LogoSection = () => {
  // Fetch logo settings from database
  const { data: logoSettings } = useQuery({
    queryKey: ['logo-settings'],
    queryFn: async () => {
      console.log('Fetching logo settings from database...');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['siteName', 'logoUrl']);

      if (error) {
        console.error('Error fetching logo settings:', error);
        return DEFAULT_LOGO_SETTINGS;
      }

      console.log('Raw logo settings from database:', data);

      // Convert array to object and handle empty/null values properly
      const settingsMap = data?.reduce((acc, setting) => {
        // Only use database value if it's not null, undefined, or empty string
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      console.log('Processed logo settings (non-empty values only):', settingsMap);

      // Merge with defaults - database values override defaults only if they exist and are not empty
      const finalSettings = {
        ...DEFAULT_LOGO_SETTINGS,
        ...settingsMap
      };

      console.log('Final logo settings with defaults:', finalSettings);
      return finalSettings;
    },
    // Cache for 30 seconds to reduce database calls
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
