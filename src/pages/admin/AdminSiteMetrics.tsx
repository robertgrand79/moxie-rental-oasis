
import React, { useEffect } from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SiteMetricsDashboard from '@/components/admin/SiteMetricsDashboard';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';
import { useLazyGoogleAnalytics } from '@/hooks/useLazyGoogleAnalytics';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

const AdminSiteMetrics = () => {
  const { settings } = useStableSiteSettings();
  
  // Lazy load Google Analytics only for this page
  const { cleanupGAResources } = useLazyGoogleAnalytics({
    enabled: true,
    googleAnalyticsId: settings.googleAnalyticsId || '',
    onScriptLoad: () => {
      console.log('📊 AdminSiteMetrics: GA script loaded lazily');
    },
    onScriptError: (error) => {
      console.error('❌ AdminSiteMetrics: GA script loading error:', error);
    }
  });

  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // SiteMetricsDashboard will reset to default state
      window.dispatchEvent(new CustomEvent('resetSiteMetricsDashboard'));
    }
  });

  // Cleanup GA resources when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      console.log('🧹 AdminSiteMetrics: Component unmounting, cleaning up GA resources');
      cleanupGAResources();
    };
  }, [cleanupGAResources]);

  return (
    <AdminPageWrapper
      title="Site Metrics"
      description="Monitor your website's performance, uptime, and user experience metrics"
    >
      <div className="p-6">
        <SiteMetricsDashboard />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSiteMetrics;
