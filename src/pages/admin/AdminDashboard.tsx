
import React from 'react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import AdminWelcomeSection from '@/components/admin/dashboard/AdminWelcomeSection';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <AdminWelcomeSection />
      <EnhancedAdminDashboard />
    </div>
  );
};

export default AdminDashboard;
