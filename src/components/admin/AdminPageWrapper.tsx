
import React from 'react';
import { Shield } from 'lucide-react';
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
  const { isOrgAdmin, loading: orgLoading } = useCurrentOrganization();

  // User has admin access if they have legacy admin role OR are an org admin/owner
  const hasAdminAccess = isLegacyAdmin || isOrgAdmin();
  const loading = authLoading || orgLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <AdminAccessSetup />
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <AdminAccessSetup />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
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
