
import React from 'react';
import SampleDataManager from '@/components/admin/SampleDataManager';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

const SampleDataManagement = () => {
  return (
    <AdminPageWrapper 
      title="Sample Data Management"
      description="Populate your site with sample content"
    >
      <SampleDataManager />
    </AdminPageWrapper>
  );
};

export default SampleDataManagement;
