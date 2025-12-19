import React, { useCallback } from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import ModernNewsletterPage from '@/components/admin/newsletter/ModernNewsletterPage';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminNewsletterManagement = () => {
  // State reset handler for sidebar navigation
  const resetToDefaultState = useCallback(() => {
    window.dispatchEvent(new CustomEvent('resetNewsletterTabs'));
  }, []);

  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ onReset: resetToDefaultState });

  return (
    <AdminPageWrapper
      title="Newsletter Management"
      description="Create, send, and manage your newsletter campaigns"
    >
      <div className="p-6">
        <ModernNewsletterPage />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminNewsletterManagement;
