
import React from 'react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import ContentStatsDashboard from '@/components/admin/ContentStatsDashboard';
import AdminWelcomeSection from '@/components/admin/dashboard/AdminWelcomeSection';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <AdminWelcomeSection />
      <ContentStatsDashboard />
      <EnhancedAdminDashboard />
    </div>
  );
};

export default AdminDashboard;
