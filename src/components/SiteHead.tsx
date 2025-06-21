
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { useHeroSettings } from '@/components/home/hooks/useHeroSettings';
import { useSiteMetaTags } from '@/hooks/useSiteMetaTags';
import { useHeroImagePreload } from '@/hooks/useHeroImagePreload';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { useThirdPartyScripts } from '@/hooks/useThirdPartyScripts';

const SiteHead = () => {
  const { settings } = useStableSiteSettings();
  const { settings: heroSettings } = useHeroSettings();

  const { isHomePage } = useSiteMetaTags(settings);

  useHeroImagePreload(heroSettings.heroBackgroundImage, isHomePage);
  
  useGoogleAnalytics(settings.googleAnalyticsId || '');
  
  useThirdPartyScripts(
    settings.googleTagManagerId || '',
    settings.facebookPixelId || '',
    settings.customHeaderScripts || '',
    settings.customFooterScripts || '',
    settings.customCss || ''
  );

  return null;
};

export default SiteHead;
