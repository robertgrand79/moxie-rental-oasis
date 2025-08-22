import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SystemAdministrationDashboard from '@/components/admin/SystemAdministrationDashboard';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminSystemAdministration = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // Reset system administration dashboard
      window.dispatchEvent(new CustomEvent('resetSystemAdministration'));
    }
  });

  return (
    <AdminPageWrapper
      title="System Administration"
      description="Comprehensive system metrics, testing, optimization, and diagnostics"
    >
      <div className="p-6">
        <SystemAdministrationDashboard />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSystemAdministration;