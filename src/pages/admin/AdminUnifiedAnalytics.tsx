import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import UnifiedAnalyticsDashboard from '@/components/admin/analytics/UnifiedAnalyticsDashboard';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminUnifiedAnalytics = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // Reset all analytics dashboards to default state
      window.dispatchEvent(new CustomEvent('resetAnalyticsDashboard'));
    }
  });

  return (
    <AdminPageWrapper
      title="Analytics & Insights"
      description="Comprehensive analytics covering content performance, site health, marketing metrics, and real-time monitoring"
    >
      <UnifiedAnalyticsDashboard />
    </AdminPageWrapper>
  );
};

export default AdminUnifiedAnalytics;