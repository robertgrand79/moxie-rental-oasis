
import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminBreadcrumb } from '@/components/admin/AdminBreadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AdminSidebar />
          <main className="flex-1 flex flex-col">
            {/* Admin Header */}
            <div className="bg-white/95 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <AdminBreadcrumb />
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  View Site
                </Link>
                <div className="text-sm text-gray-600">
                  Welcome, {user.email}
                </div>
              </div>
            </div>
            
            {/* Admin Content */}
            <div className="flex-1 p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
