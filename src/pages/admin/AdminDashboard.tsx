import React from 'react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import AdminWelcomeSection from '@/components/admin/dashboard/AdminWelcomeSection';
import SetupBanner from '@/components/admin/dashboard/SetupBanner';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <SetupBanner />
      <AdminWelcomeSection />
      <EnhancedAdminDashboard />
    </div>
  );
};

export default AdminDashboard;

