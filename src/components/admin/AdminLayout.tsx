import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Menu, Globe } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import OrganizationBadge from './OrganizationBadge';
import OrganizationSwitcher from './OrganizationSwitcher';
import ContextBanner from './ContextBanner';
import NotificationBell from './notifications/NotificationBell';
import SupportWidget from '@/components/support/SupportWidget';
import TemplateEditingBanner from './TemplateEditingBanner';
import TrialBanner from './TrialBanner';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster } from '@/components/ui/sonner';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

  // Prevent any page-level horizontal scrolling in admin.
  // This ensures wide inner content (like the calendar grid) cannot move under the fixed sidebar;
  // only the intended inner scrollers should scroll horizontally.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflowX = html.style.overflowX;
    const prevBodyOverflowX = body.style.overflowX;

    html.style.overflowX = 'hidden';
    body.style.overflowX = 'hidden';

    return () => {
      html.style.overflowX = prevHtmlOverflowX;
      body.style.overflowX = prevBodyOverflowX;
    };
  }, []);

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
    <div className="min-h-screen bg-muted/30 w-full overflow-x-hidden">
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex w-full min-h-screen min-w-0 overflow-x-hidden">
          <AdminSidebar />
          <SidebarInset className="flex-1 min-w-0">
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
                  
                  {/* Show template editing banner if applicable */}
                  {isTemplateEditing && (
                    <TemplateEditingBanner variant="header" />
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {/* View Site icon button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {isExternalBack ? (
                        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                          <a href={backUrl} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-5 w-5" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                          <Link to={backUrl} target="_blank">
                            <Globe className="h-5 w-5" />
                          </Link>
                        </Button>
                      )}
                    </TooltipTrigger>
                    <TooltipContent>View Site</TooltipContent>
                  </Tooltip>
                  
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  {/* Organization context badge */}
                  {!isMobile && !isPlatformAdmin && <OrganizationBadge />}
                </div>
              </div>
            </header>
            <main className={`flex-1 overflow-y-auto overflow-x-hidden min-w-0 ${isMobile ? 'p-4' : 'p-8'}`}>
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
