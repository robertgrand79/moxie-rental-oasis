
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

const SettingsLoadingState = () => {
  return (
    <AdminPageWrapper 
      title="Site Settings"
      description="Configure your website's appearance and functionality"
    >
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default SettingsLoadingState;
