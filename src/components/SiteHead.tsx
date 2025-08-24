
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { useHeroSettings } from '@/components/home/hooks/useHeroSettings';
import { useSiteMetaTags } from '@/hooks/useSiteMetaTags';
import { useHeroImagePreload } from '@/hooks/useHeroImagePreload';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { useThirdPartyScripts } from '@/hooks/useThirdPartyScripts';
import { useLocation } from 'react-router-dom';
import SecurityProvider from '@/components/SecurityProvider';

const SiteHead = () => {
  const { settings } = useStableSiteSettings();
  const { settings: heroSettings } = useHeroSettings();
  const location = useLocation();

  const { isHomePage } = useSiteMetaTags(settings);

  // Skip hero image preload since ModernHeroSection uses AnimatedBackground
  // useHeroImagePreload(heroSettings.heroBackgroundImage, isHomePage);
  
  // Load analytics on non-admin pages, except specifically allow on /admin/metrics and /admin/analytics
  const isAdminPage = location.pathname.startsWith('/admin');
  const isMetricsPage = location.pathname === '/admin/metrics';
  const isAnalyticsPage = location.pathname === '/admin/analytics';
  const shouldLoadAnalytics = !isAdminPage || isMetricsPage || isAnalyticsPage;
  
  if (shouldLoadAnalytics) {
    // Only use regular GA loading for non-metrics and non-analytics pages
    // Metrics and analytics pages will use lazy loading for better performance
    if (!isMetricsPage && !isAnalyticsPage) {
      useGoogleAnalytics(settings.googleAnalyticsId || '');
    }
    
    useThirdPartyScripts(
      settings.googleTagManagerId || '',
      settings.facebookPixelId || '',
      settings.customHeaderScripts || '',
      settings.customFooterScripts || '',
      settings.customCss || ''
    );
  }

  return (
    <SecurityProvider>
      {null}
    </SecurityProvider>
  );
};

export default SiteHead;
