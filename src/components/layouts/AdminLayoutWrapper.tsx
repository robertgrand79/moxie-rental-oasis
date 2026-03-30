import React, { Suspense, useRef } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { PlatformAnnouncementBanner } from '@/components/admin/PlatformAnnouncementBanner';
import InstallBanner from '@/components/pwa/InstallBanner';
import IOSInstallPrompt from '@/components/pwa/IOSInstallPrompt';

// Content loader for lazy-loaded admin pages
const ContentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AdminLayoutWrapper = () => {
  const { organization, isPlatformAdmin, loading: orgLoading } = useCurrentOrganization();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Track if we've successfully loaded at least once
  // This prevents full-page loading on subsequent navigations
  const hasLoadedRef = useRef(false);

  // Only block on initial load when we have no data yet
  // After first successful load, preserve layout during navigation
  const needsFullLoad = (authLoading || orgLoading) && !hasLoadedRef.current;

  if (needsFullLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to auth
  if (!user) {
    // Reset on logout
    hasLoadedRef.current = false;
    navigate('/auth', { replace: true });
    return null;
  }

  // Mark as loaded once we have user
  if (!authLoading && !orgLoading) {
    hasLoadedRef.current = true;
  }

  // Platform admins can access admin area even without organization
  if (!isPlatformAdmin && !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Organization Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be a member of an organization to access the admin area.
          </p>
          <Link 
            to="/"
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <InstallBanner />
      <AdminLayout>
        <PlatformAnnouncementBanner />
        <Suspense fallback={<ContentLoader />}>
          <Outlet />
        </Suspense>
      </AdminLayout>
      <IOSInstallPrompt />
    </>
  );
};

export default AdminLayoutWrapper;
