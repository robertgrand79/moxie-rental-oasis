
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_HERO_SETTINGS = {
  heroTitle: 'Your Home Away From Home',
  heroSubtitle: 'in Eugene',
  heroDescription: 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.',
  heroLocationText: 'Eugene, Oregon',
  heroCTAText: 'View Properties',
  heroBackgroundImage: ''
};

export const useHeroSettings = () => {
  const { data: heroSettings, isLoading, error: queryError } = useQuery({
    queryKey: ['hero-settings'], 
    queryFn: async () => {
      console.log('🔄 Fetching hero settings from database...');
      
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'heroTitle',
          'heroSubtitle', 
          'heroDescription',
          'heroLocationText',
          'heroCTAText',
          'heroBackgroundImage'
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
    staleTime: 10 * 60 * 1000, // 10 minutes - longer caching
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchInterval: false,
    retry: 1, // Reduced retries for faster fallback
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false // Use cached data when available
  });

  return {
    settings: heroSettings || DEFAULT_HERO_SETTINGS,
    isLoading,
    error: queryError
  };
};
