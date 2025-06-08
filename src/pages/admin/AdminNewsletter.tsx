
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import NewsletterManager from '@/components/NewsletterManager';

const AdminNewsletter = () => {
  return (
    <AdminPageWrapper
      title="Newsletter Management"
      description="Create and send newsletters to your subscribers"
    >
      <div className="p-6">
        <NewsletterManager />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminNewsletter;
