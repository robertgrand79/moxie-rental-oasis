import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import PlatformToolbar from './PlatformToolbar';

// Content loader for lazy-loaded platform admin pages
const ContentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const PlatformAdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <PlatformToolbar />
      <main className="flex-1 p-6 overflow-auto">
        <Suspense fallback={<ContentLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default PlatformAdminLayout;
