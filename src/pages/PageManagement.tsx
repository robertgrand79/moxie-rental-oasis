
import React from 'react';
import PagesManager from '@/components/admin/pages/PagesManager';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

const PageManagement = () => {
  return (
    <AdminPageWrapper
      title="Page Management"
      description="Manage your website pages and content"
    >
      <div className="p-8">
        <PagesManager />
      </div>
    </AdminPageWrapper>
  );
};

export default PageManagement;
