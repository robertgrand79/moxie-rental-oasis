
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import AIAnalyticsDashboard from '@/components/admin/AIAnalyticsDashboard';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminAnalytics = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // AIAnalyticsDashboard will reset to default state
      window.dispatchEvent(new CustomEvent('resetAnalyticsDashboard'));
    }
  });

  return (
    <AdminPageWrapper
      title="AI Analytics"
      description="Monitor AI performance, content insights, and user engagement metrics"
    >
      <AIAnalyticsDashboard />
    </AdminPageWrapper>
  );
};

export default AdminAnalytics;
