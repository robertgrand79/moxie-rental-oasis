
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SiteMetricsDashboard from '@/components/admin/SiteMetricsDashboard';

const AdminSiteMetrics = () => {
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
