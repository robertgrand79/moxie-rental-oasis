
import React from 'react';
import PagesManager from '@/components/admin/pages/PagesManager';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

const PageManagement = () => {
  return (
    <AdminPageWrapper
      title="Custom Pages"
      description="Create additional custom pages for your site"
    >
      <div className="p-8">
        <PagesManager />
      </div>
    </AdminPageWrapper>
  );
};

export default PageManagement;
