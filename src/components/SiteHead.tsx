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
  
  // Hooks must be called unconditionally - pass empty strings when not loading
  useThirdPartyScripts(
    shouldLoadAnalytics ? (settings.googleTagManagerId || '') : '',
    shouldLoadAnalytics ? (settings.facebookPixelId || '') : '',
    shouldLoadAnalytics ? (settings.customHeaderScripts || '') : '',
    shouldLoadAnalytics ? (settings.customFooterScripts || '') : '',
    shouldLoadAnalytics ? (settings.customCss || '') : ''
  );

  return (
    <SecurityProvider>
      {null}
    </SecurityProvider>
  );
};

export default SiteHead;
