
import React from 'react';
import AdminAccessSetup from '@/components/admin/AdminAccessSetup';

const AdminAccessSetupPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Access Setup
          </h1>
          <p className="text-lg text-gray-600">
            Configure your admin permissions to access all backend features
          </p>
        </div>
        
        <AdminAccessSetup />
      </div>
    </div>
  );
};

export default AdminAccessSetupPage;
