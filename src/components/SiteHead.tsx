
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { useHeroSettings } from '@/components/home/hooks/useHeroSettings';
import { useSiteMetaTags } from '@/hooks/useSiteMetaTags';
import { useHeroImagePreload } from '@/hooks/useHeroImagePreload';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { useThirdPartyScripts } from '@/hooks/useThirdPartyScripts';
import { useLocation } from 'react-router-dom';

const SiteHead = () => {
  const { settings } = useStableSiteSettings();
  const { settings: heroSettings } = useHeroSettings();
  const location = useLocation();

  const { isHomePage } = useSiteMetaTags(settings);

  // Only preload hero image on home page
  useHeroImagePreload(heroSettings.heroBackgroundImage, isHomePage);
  
  // Load analytics on non-admin pages, except specifically allow on /admin/metrics
  const isAdminPage = location.pathname.startsWith('/admin');
  const isMetricsPage = location.pathname === '/admin/metrics';
  const shouldLoadAnalytics = !isAdminPage || isMetricsPage;
  
  if (shouldLoadAnalytics) {
    useGoogleAnalytics(settings.googleAnalyticsId || '');
    
    useThirdPartyScripts(
      settings.googleTagManagerId || '',
      settings.facebookPixelId || '',
      settings.customHeaderScripts || '',
      settings.customFooterScripts || '',
      settings.customCss || ''
    );
  }

  return null;
};

export default SiteHead;
