import { useTenantMetaTags } from '@/hooks/useTenantMetaTags';
import { useThirdPartyScripts } from '@/hooks/useThirdPartyScripts';
import { useLocation } from 'react-router-dom';
import SecurityProvider from '@/components/SecurityProvider';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const SiteHead = () => {
  const location = useLocation();
  const { settings } = useTenantSettings();

  // Apply tenant-specific meta tags (title, favicon, OG tags)
  useTenantMetaTags();
  
  // Load analytics on non-admin pages, except specifically allow on /admin/metrics and /admin/analytics
  const isAdminPage = location.pathname.startsWith('/admin');
  const isMetricsPage = location.pathname === '/admin/metrics';
  const isAnalyticsPage = location.pathname === '/admin/analytics';
  const shouldLoadAnalytics = !isAdminPage || isMetricsPage || isAnalyticsPage;
  
  if (shouldLoadAnalytics) {
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
