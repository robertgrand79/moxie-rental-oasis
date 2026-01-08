import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';
import PlatformAdminSidebar from './PlatformAdminSidebar';
import PlatformToolbar from './PlatformToolbar';
import { usePlatformPreferences } from '@/hooks/usePlatformPreferences';

// Content loader for lazy-loaded platform admin pages
const ContentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);
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
            <Suspense fallback={<ContentLoader />}>
              <Outlet />
            </Suspense>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PlatformAdminLayout;
