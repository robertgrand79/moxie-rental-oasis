import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import OrganizationBadge from './OrganizationBadge';
import NotificationBell from './notifications/NotificationBell';
import SupportWidget from '@/components/support/SupportWidget';
import TemplateEditingBanner from './TemplateEditingBanner';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster } from '@/components/ui/sonner';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { organization } = useCurrentOrganization();
  const { isPlatformAdmin } = usePlatformAdmin();
  
  const isTemplateEditing = isPlatformAdmin && organization?.is_template_source;

  // Clear stale tenant-related caches when entering admin to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['tenant'] });
    queryClient.invalidateQueries({ queryKey: ['organization'] });
    queryClient.invalidateQueries({ queryKey: ['site-settings'] });
  }, [queryClient]);

  // Navigate to root of current domain - works for both Lovable preview and production
  const backUrl = '/';
  
  return (
    <div className="min-h-screen bg-muted/30 w-full">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex w-full min-h-screen">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            <header className={`flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background ${isMobile ? 'px-3' : ''}`}>
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-2">
                  {/* Mobile menu trigger - only visible on mobile */}
                  {isMobile && (
                    <SidebarTrigger className="min-h-[44px] min-w-[44px]">
                      <Menu className="h-5 w-5" />
                    </SidebarTrigger>
                  )}
                  
                  {/* Show different header content based on template editing mode */}
                  {isTemplateEditing ? (
                    <TemplateEditingBanner variant="header" />
                  ) : (
                    <EnhancedButton 
                      variant="outline" 
                      size={isMobile ? "sm" : "default"} 
                      asChild 
                      className={isMobile ? 'min-h-[44px]' : ''}
                    >
                      <Link to={backUrl} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span className={isMobile ? 'hidden' : 'inline'}>Back to Site</span>
                        <span className={isMobile ? 'inline' : 'hidden'}>Back</span>
                      </Link>
                    </EnhancedButton>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  {/* Organization context badge */}
                  {!isMobile && <OrganizationBadge />}
                </div>
              </div>
            </header>
            <main className={`flex-1 overflow-auto ${isMobile ? 'p-4' : 'p-8'}`}>
              {children}
            </main>
          </SidebarInset>
          
          {/* Support Widget */}
          <SupportWidget />
          <Toaster position="top-center" richColors />
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminLayout;
