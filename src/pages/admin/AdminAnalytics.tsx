
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import AIAnalyticsDashboard from '@/components/admin/AIAnalyticsDashboard';

const AdminAnalytics = () => {
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
