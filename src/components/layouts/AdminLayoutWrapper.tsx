
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminLayoutWrapper = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminLayoutWrapper;
