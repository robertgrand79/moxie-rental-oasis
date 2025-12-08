import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SimplifiedAnalyticsDashboard from '@/components/admin/analytics/SimplifiedAnalyticsDashboard';

const AdminUnifiedAnalytics = () => {
  return (
    <AdminPageWrapper
      title="Site Overview"
      description="Key metrics for your vacation rental business"
    >
      <SimplifiedAnalyticsDashboard />
    </AdminPageWrapper>
  );
};

export default AdminUnifiedAnalytics;