import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminLayoutWrapper = () => {
  const { organization, isPlatformAdmin, loading: orgLoading, isOrgAdmin } = useCurrentOrganization();
  const { user, loading: authLoading } = useAuth();
  const [minLoadTime, setMinLoadTime] = useState(true);

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
    window.location.href = '/auth';
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
          <a 
            href="/"
            className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminLayoutWrapper;
