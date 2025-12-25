import React, { Suspense, useEffect, useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Content loader for lazy-loaded admin pages
const ContentLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AdminLayoutWrapper = () => {
  const { organization, isPlatformAdmin, loading: orgLoading, isOrgAdmin } = useCurrentOrganization();
  const { user, loading: authLoading } = useAuth();
  const [minLoadTime, setMinLoadTime] = useState(true);
  const navigate = useNavigate();

  // Ensure minimum loading time to prevent flash of incorrect content
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadTime(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Wait for both contexts to fully load
  const isFullyLoaded = !authLoading && !orgLoading && !minLoadTime;

  if (!isFullyLoaded) {
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
    navigate('/auth', { replace: true });
    return null;
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
    <AdminLayout>
      <Suspense fallback={<ContentLoader />}>
        <Outlet />
      </Suspense>
    </AdminLayout>
  );
};

export default AdminLayoutWrapper;
