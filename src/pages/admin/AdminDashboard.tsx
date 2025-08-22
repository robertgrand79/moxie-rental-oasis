
import React from 'react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import ContentStatsDashboard from '@/components/admin/ContentStatsDashboard';

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <ContentStatsDashboard />
      <EnhancedAdminDashboard />
    </div>
  );
};

export default AdminDashboard;
