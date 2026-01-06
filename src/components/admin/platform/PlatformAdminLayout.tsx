import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import PlatformAdminSidebar from './PlatformAdminSidebar';
import PlatformToolbar from './PlatformToolbar';
import { usePlatformPreferences } from '@/hooks/usePlatformPreferences';

const PlatformAdminLayout = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = usePlatformPreferences();

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="flex min-h-screen w-full bg-background">
        <PlatformAdminSidebar 
          collapsed={sidebarCollapsed} 
          onCollapsedChange={setSidebarCollapsed} 
        />
        <SidebarInset className="flex flex-col flex-1">
          <PlatformToolbar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PlatformAdminLayout;
