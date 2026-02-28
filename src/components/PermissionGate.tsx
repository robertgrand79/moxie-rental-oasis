import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useTeamPermissions, PermissionKey } from '@/hooks/useTeamPermissions';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredPermission: PermissionKey;
  redirectTo?: string;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  requiredPermission,
  redirectTo = '/admin',
}) => {
  const { hasPermission, loading } = useTeamPermissions();
  const { isPlatformAdmin, checkingAdmin } = usePlatformAdmin();
  const toastShownRef = useRef(false);

  const isLoading = loading || checkingAdmin;
  const allowed = isPlatformAdmin || hasPermission(requiredPermission);

  useEffect(() => {
    if (!isLoading && !allowed && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error('Access Denied', {
        description: 'You don\'t have permission to access this area.',
      });
    }
  }, [isLoading, allowed]);

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PermissionGate;
