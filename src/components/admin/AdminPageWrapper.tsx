import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import AdminAccessSetup from '@/components/admin/AdminAccessSetup';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const AdminPageWrapper = ({ children, title, description, actions }: AdminPageWrapperProps) => {
  const { user, isAdmin: isLegacyAdmin, loading: authLoading } = useAuth();
  const { isOrgAdmin, loading: orgLoading, organization, isPlatformAdmin } = useCurrentOrganization();

  // Wait for BOTH auth and org context to fully load before making decisions
  const isFullyLoaded = !authLoading && !orgLoading;
  
  // Show loading state while either context is loading
  if (!isFullyLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading admin access...</p>
        </div>
      </div>
    );
  }

  // User has admin access if they have legacy admin role OR are an org admin/owner OR are platform admin
  const hasAdminAccess = isLegacyAdmin || isOrgAdmin() || isPlatformAdmin;

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-12">
        <AdminAccessSetup />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background py-12">
        <AdminAccessSetup />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminPageWrapper;
