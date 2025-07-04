
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SiteMetricsDashboard from '@/components/admin/SiteMetricsDashboard';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminSiteMetrics = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // SiteMetricsDashboard will reset to default state
      window.dispatchEvent(new CustomEvent('resetSiteMetricsDashboard'));
    }
  });

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
