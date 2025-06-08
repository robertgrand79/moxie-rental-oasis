
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarProvider defaultOpen={true}>
        <div className="flex w-full min-h-screen">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center justify-between w-full">
                <h1 className="text-lg font-semibold">Moxie Command</h1>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Site
                  </Link>
                </Button>
              </div>
            </header>
            <main className="flex-1 p-8 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
