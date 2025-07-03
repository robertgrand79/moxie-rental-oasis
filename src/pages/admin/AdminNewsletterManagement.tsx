
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import NewsletterManagementTabs from '@/components/newsletter/NewsletterManagementTabs';

const AdminNewsletterManagement = () => {
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
