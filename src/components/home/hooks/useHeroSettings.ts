
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

// Generic defaults - no hardcoded brand references
const DEFAULT_HERO_SETTINGS = {
  heroTitle: 'Welcome',
  heroSubtitle: '',
  heroDescription: 'Discover our premium vacation rental properties.',
  heroLocationText: '',
  heroCTAText: 'View Properties',
  heroBackgroundImage: '',
  heroExploreText: 'Explore the Area'
};

export const useHeroSettings = () => {
  const { tenantId, loading: tenantLoading } = useTenant();

  const { data: heroSettings, isLoading, error: queryError } = useQuery({
    queryKey: ['hero-settings', tenantId], 
    queryFn: async () => {
      if (!tenantId) {
        console.log('🔄 No tenant ID, using defaults');
        return DEFAULT_HERO_SETTINGS;
      }

      console.log('🔄 Fetching hero settings for tenant:', tenantId);
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .eq('organization_id', tenantId)
        .in('key', [
          'heroTitle',
          'heroSubtitle', 
          'heroDescription',
          'heroLocationText',
          'heroCTAText',
          'heroBackgroundImage',
          'heroExploreText'
        ]);

      if (error) {
        console.error('❌ Error fetching hero settings:', error);
        throw error;
      }

      console.log('📄 Raw hero settings from database:', data);

      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      console.log('🔧 Processed hero settings:', settingsMap);

      const finalSettings = {
        ...DEFAULT_HERO_SETTINGS,
        ...settingsMap
      };

      console.log('✅ Final hero settings:', finalSettings);
      return finalSettings;
    },
    enabled: !tenantLoading,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchInterval: false,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  return {
    settings: heroSettings || DEFAULT_HERO_SETTINGS,
    isLoading: tenantLoading || isLoading,
    error: queryError
  };
};
