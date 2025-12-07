import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireOrganization?: boolean;
  requireOrgAdmin?: boolean;
  requireOrgOwner?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireOrganization = false,
  requireOrgAdmin = false,
  requireOrgOwner = false
}) => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { 
    organization, 
    loading: orgLoading, 
    isPlatformAdmin,
    isOrgAdmin,
    isOrgOwner,
    error: orgError
  } = useCurrentOrganization();

  const loading = authLoading || orgLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Platform admins bypass all organization checks
  if (isPlatformAdmin) {
    return <>{children}</>;
  }

  // Check if user requires organization membership
  if (requireOrganization && !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">No Organization</h1>
          <p className="text-muted-foreground mb-6">
            You need to be a member of an organization to access this area.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check admin role (profile-based admin)
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have permission to access this area.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check organization admin role
  if (requireOrgAdmin && !isOrgAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You need organization admin privileges to access this area.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check organization owner role
  if (requireOrgOwner && !isOrgOwner()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Owner Access Required</h1>
          <p className="text-muted-foreground mb-6">
            Only organization owners can access this area.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
