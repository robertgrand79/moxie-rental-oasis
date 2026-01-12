import React from 'react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import AdminWelcomeSection from '@/components/admin/dashboard/AdminWelcomeSection';
import SetupBanner from '@/components/admin/dashboard/SetupBanner';
import { FeatureErrorBoundary } from '@/components/error-boundaries/FeatureErrorBoundary';
import { DataErrorBoundary } from '@/components/error-boundaries/DataErrorBoundary';
import { useSimplifiedAnalytics } from '@/hooks/useSimplifiedAnalytics';

const AdminDashboard = () => {
  const { analytics, refresh } = useSimplifiedAnalytics();

  return (
    <div className="space-y-6">
      <FeatureErrorBoundary featureName="Setup Banner" showRetry={false}>
        <SetupBanner />
      </FeatureErrorBoundary>
      
      <FeatureErrorBoundary featureName="Welcome Section" showRetry={false}>
        <AdminWelcomeSection 
          lastUpdated={analytics.lastUpdated}
          siteStatus={analytics.siteStatus as 'healthy' | 'warning' | 'error'}
          onRefresh={refresh}
        />
      </FeatureErrorBoundary>
      
      <DataErrorBoundary dataSource="dashboard data">
        <EnhancedAdminDashboard />
      </DataErrorBoundary>
    </div>
  );
};

export default AdminDashboard;
