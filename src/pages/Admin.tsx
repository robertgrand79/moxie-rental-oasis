
import React from 'react';
import EnhancedAdminDashboard from '@/components/admin/EnhancedAdminDashboard';
import ContentStatsDashboard from '@/components/admin/ContentStatsDashboard';

const Admin = () => {
  return (
    <div className="space-y-8">
      <EnhancedAdminDashboard />
      <ContentStatsDashboard />
    </div>
  );
};

export default Admin;
