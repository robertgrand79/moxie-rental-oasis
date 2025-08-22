
import React from 'react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import ContentStatsDashboard from '@/components/admin/ContentStatsDashboard';
import AdminWelcomeSection from '@/components/admin/dashboard/AdminWelcomeSection';
import UserProfileSection from '@/components/admin/UserProfileSection';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <AdminWelcomeSection />
      <ContentStatsDashboard />
      <EnhancedAdminDashboard />
      
      {/* User Profile Section at bottom */}
      <div className="max-w-md">
        <UserProfileSection />
      </div>
    </div>
  );
};

export default AdminDashboard;
