import React from 'react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import AdminWelcomeSection from '@/components/admin/dashboard/AdminWelcomeSection';
import SetupBanner from '@/components/admin/dashboard/SetupBanner';
import { FeatureErrorBoundary } from '@/components/error-boundaries/FeatureErrorBoundary';
import { DataErrorBoundary } from '@/components/error-boundaries/DataErrorBoundary';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <FeatureErrorBoundary featureName="Setup Banner" showRetry={false}>
        <SetupBanner />
      </FeatureErrorBoundary>
      
      <FeatureErrorBoundary featureName="Welcome Section" showRetry={false}>
        <AdminWelcomeSection />
      </FeatureErrorBoundary>
      
      <DataErrorBoundary dataSource="dashboard data">
        <EnhancedAdminDashboard />
      </DataErrorBoundary>
    </div>
  );
};

export default AdminDashboard;
