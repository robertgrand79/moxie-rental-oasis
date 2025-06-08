
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import NavBar from '@/components/NavBar';

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
