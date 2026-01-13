import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';

interface AdminDomainGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard for admin.staymoxie.com
 * - Auto-redirects to Platform Command Center when on admin subdomain
 * - Blocks non-platform admins with Access Denied page
 */
const AdminDomainGuard: React.FC<AdminDomainGuardProps> = ({ children }) => {
  const { isPlatformAdminDomain } = usePlatform();
  const { isPlatformAdmin, checkingAdmin } = usePlatformAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // On admin.staymoxie.com, always redirect to Platform Command Center
    if (isPlatformAdminDomain && isPlatformAdmin && !location.pathname.startsWith('/admin/platform')) {
      if (location.pathname.startsWith('/admin')) {
        navigate('/admin/platform', { replace: true });
      }
    }
  }, [isPlatformAdminDomain, isPlatformAdmin, location.pathname, navigate]);

  // Still checking admin status
  if (isPlatformAdminDomain && checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Block non-platform admins on admin subdomain
  if (isPlatformAdminDomain && !checkingAdmin && !isPlatformAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 p-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This domain is restricted to platform administrators only.
        </p>
        <a 
          href="https://staymoxie.com" 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to StayMoxie
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminDomainGuard;
