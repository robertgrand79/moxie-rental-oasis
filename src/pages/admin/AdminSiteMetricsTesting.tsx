import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SiteMetricsTestingDashboard from '@/components/admin/SiteMetricsTestingDashboard';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminSiteMetricsTesting = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // Reset testing dashboard
      window.dispatchEvent(new CustomEvent('resetSiteMetricsTesting'));
    }
  });

  return (
    <AdminPageWrapper
      title="Site Metrics Testing"
      description="Comprehensive testing and validation of Site Metrics functionality"
    >
      <div className="p-6">
        <SiteMetricsTestingDashboard />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSiteMetricsTesting;