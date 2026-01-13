import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import PlatformToolbar from './PlatformToolbar';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

// Content loader for lazy-loaded platform admin pages
const ContentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const PlatformAdminLayout = () => {
  const { isPlatformAdmin, checkingAdmin } = usePlatformAdmin();
  const { enterPlatformMode, isPlatformMode } = useCurrentOrganization();

  // Auto-enter platform mode when accessing Platform Command Center
  useEffect(() => {
    if (isPlatformAdmin && !isPlatformMode) {
      enterPlatformMode();
    }
  }, [isPlatformAdmin, isPlatformMode, enterPlatformMode]);

  // Show loading while checking admin status
  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect non-platform admins
  if (!isPlatformAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 p-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md">
          The Platform Command Center is restricted to designated platform administrators only.
        </p>
        <a 
          href="/admin" 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Return to Admin Dashboard
        </a>
      </div>
    );
  }

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
