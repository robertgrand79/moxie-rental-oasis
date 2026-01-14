import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import OrganizationBadge from './OrganizationBadge';
import OrganizationSwitcher from './OrganizationSwitcher';
import ContextBanner from './ContextBanner';
import NotificationBell from './notifications/NotificationBell';
import SupportWidget from '@/components/support/SupportWidget';
import TemplateEditingBanner from './TemplateEditingBanner';
import TrialBanner from './TrialBanner';
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
  const { organization, isPlatformMode } = useCurrentOrganization();
  const { isPlatformAdmin } = usePlatformAdmin();
  
  const isTemplateEditing = isPlatformAdmin && organization?.is_template_source;

  // Clear stale tenant-related caches when entering admin to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['tenant'] });
    queryClient.invalidateQueries({ queryKey: ['organization'] });
    queryClient.invalidateQueries({ queryKey: ['site-settings'] });
  }, [queryClient]);

  // Calculate back URL based on organization context
  const getBackToSiteUrl = (): { url: string; isExternal: boolean } => {
    // If in platform mode or no organization, go to platform home
    if (isPlatformMode || !organization) {
      return { url: '/', isExternal: false };
    }
    
    const hostname = window.location.hostname;
    const orgCustomDomain = organization.custom_domain;
    const orgSubdomain = `${organization.slug}.staymoxie.com`;
    const isNeutralDomain = hostname.includes('lovable.app') || 
                            hostname.includes('localhost') || 
                            hostname.includes('127.0.0.1');
    
    // Check if we're already on the org's actual domain
    if (orgCustomDomain && (hostname === orgCustomDomain || hostname === `www.${orgCustomDomain}`)) {
      return { url: '/', isExternal: false };
    }
    
    if (hostname === orgSubdomain) {
      return { url: '/', isExternal: false };
    }
    
    // On neutral domains (Lovable, localhost), use ?org= param for context sync
    if (isNeutralDomain) {
      // Persist org context for public pages
      sessionStorage.setItem('admin_current_org_slug', organization.slug);
      return { url: `/?org=${organization.slug}`, isExternal: false };
    }
    
    // Otherwise, redirect to the org's actual website
    if (orgCustomDomain) {
      return { url: `https://${orgCustomDomain}`, isExternal: true };
    }
    
    return { url: `https://${orgSubdomain}`, isExternal: true };
  };

  const { url: backUrl, isExternal: isExternalBack } = getBackToSiteUrl();
  
  return (
    <div className="min-h-screen bg-muted/30 w-full">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex w-full min-h-screen">
          <AdminSidebar />
          <SidebarInset className="flex-1">
            {/* Context Banner for Platform Admins viewing a tenant */}
            <ContextBanner />
            {/* Trial Banner - sticky at top */}
            <TrialBanner />
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
                    isExternalBack ? (
                      <EnhancedButton 
                        variant="outline" 
                        size={isMobile ? "sm" : "default"} 
                        asChild 
                        className={isMobile ? 'min-h-[44px]' : ''}
                      >
                        <a href={backUrl} className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          <span className={isMobile ? 'hidden' : 'inline'}>Back to Site</span>
                          <span className={isMobile ? 'inline' : 'hidden'}>Back</span>
                        </a>
                      </EnhancedButton>
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
                    )
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  {/* Organization context badge */}
                  {!isMobile && !isPlatformAdmin && <OrganizationBadge />}
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
