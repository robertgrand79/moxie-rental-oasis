
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { debug } from '@/utils/debug';

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
        debug.settings('🔄 No tenant ID, using defaults');
        return DEFAULT_HERO_SETTINGS;
      }

      debug.settings('🔄 Fetching hero settings for tenant:', tenantId);
      
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

      debug.settings('📄 Raw hero settings from database:', data);

      const settingsMap = data?.reduce((acc, setting) => {
        if (setting.value !== null && setting.value !== undefined && setting.value !== '') {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      debug.settings('🔧 Processed hero settings:', settingsMap);

      const finalSettings = {
        ...DEFAULT_HERO_SETTINGS,
        ...settingsMap
      };

      debug.settings('✅ Final hero settings:', finalSettings);
      return finalSettings;
    },
    enabled: !tenantLoading,
    staleTime: 30 * 1000, // 30 seconds - allow faster updates
    gcTime: 60 * 1000,
    refetchInterval: false,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  return {
    settings: heroSettings || DEFAULT_HERO_SETTINGS,
    isLoading: tenantLoading || isLoading,
    error: queryError
  };
};
