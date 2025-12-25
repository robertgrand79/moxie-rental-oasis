import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminErrorBoundary from './AdminErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Shield, RefreshCw } from 'lucide-react';

interface RoleManagementErrorBoundaryProps {
  children: React.ReactNode;
}

const RoleManagementErrorBoundary = ({ children }: RoleManagementErrorBoundaryProps) => {
  const navigate = useNavigate();

  const handleRoleError = (error: Error) => {
    console.error('Role Management Error:', error);
    
    // Could add specific role-related error handling here
    // For example, check if it's a permissions error vs. network error
  };

  const roleSpecificFallback = (
    <div className="p-6">
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertTitle>Role Management Error</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>
            There was an issue loading the roles and permissions system. This could be due to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Network connectivity issues</li>
            <li>Database connection problems</li>
            <li>Insufficient permissions to access role data</li>
            <li>Temporary server issues</li>
          </ul>
          <div className="flex gap-2 mt-4">
            <EnhancedButton
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Reload Page
            </EnhancedButton>
            <EnhancedButton
              onClick={() => navigate('/admin')}
              variant="ghost"
              size="sm"
            >
              Return to Dashboard
            </EnhancedButton>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <AdminErrorBoundary
      context="Role Management"
      fallback={roleSpecificFallback}
      onError={handleRoleError}
    >
      {children}
    </AdminErrorBoundary>
  );
};

export default RoleManagementErrorBoundary;
