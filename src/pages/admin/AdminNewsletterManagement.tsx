
import React, { useCallback } from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import NewsletterManagementTabs from '@/components/newsletter/NewsletterManagementTabs';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminNewsletterManagement = () => {
  // State reset handler for sidebar navigation
  const resetToDefaultState = useCallback(() => {
    // Newsletter tabs will reset to default "create" tab
    // This forces a re-render of NewsletterManagementTabs component
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
        <NewsletterManagementTabs />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminNewsletterManagement;
