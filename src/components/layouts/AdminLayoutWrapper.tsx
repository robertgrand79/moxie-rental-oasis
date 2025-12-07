import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Loader2 } from 'lucide-react';

const AdminLayoutWrapper = () => {
  const { organization, isPlatformAdmin, loading, isOrgAdmin } = useCurrentOrganization();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading organization...</p>
        </div>
      </div>
    );
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

  // Non-admins (members) can only access limited routes - this is enforced per-route
  // But they can still access the admin layout

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminLayoutWrapper;
