import React from 'react';
import { Outlet } from 'react-router-dom';
import PlatformNavbar from '@/components/platform/PlatformNavbar';
import PlatformFooter from '@/components/platform/PlatformFooter';
import { Toaster } from '@/components/ui/toaster';

const PlatformLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PlatformNavbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <PlatformFooter />
      <Toaster />
    </div>
  );
};

export default PlatformLayout;
