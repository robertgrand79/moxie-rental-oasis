import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import PlatformNavbar from '@/components/platform/PlatformNavbar';
import PlatformFooter from '@/components/platform/PlatformFooter';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

// Content loader for lazy-loaded pages
const ContentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const PlatformLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PlatformNavbar />
      <main className="flex-1 pt-16">
        <Suspense fallback={<ContentLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <PlatformFooter />
      <Toaster />
    </div>
  );
};

export default PlatformLayout;
