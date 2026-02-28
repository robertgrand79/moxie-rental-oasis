import React, { useMemo } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AdminSidebarSection from './sidebar/AdminSidebarSection';
import AdminSidebarFooter from './sidebar/AdminSidebarFooter';
import { adminMenuItems } from './sidebar/adminMenuItems';
import type { MenuSection, MenuItem } from './sidebar/adminMenuItems';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import TemplateEditingBanner from './TemplateEditingBanner';
import OrganizationSwitcher from './OrganizationSwitcher';

const AdminSidebar = () => {
  const isMobile = useIsMobile();
  const { settings, loading: settingsLoading } = useSimplifiedSiteSettings();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const { isPlatformAdmin, checkingAdmin } = usePlatformAdmin();
  const { hasPermission, loading: permLoading } = useTeamPermissions();
  const { state, toggleSidebar } = useSidebar();
  
  const isCollapsed = state === 'collapsed';
  const logoUrl = settings.siteLogo || organization?.logo_url;
  const isLoading = settingsLoading || orgLoading;

  const filteredMenuItems = useMemo(() => {
    // While loading permissions, show nothing to avoid flash
    if (permLoading) return [];

    return adminMenuItems
      .map((section: MenuSection) => {
        // Hide Platform Administration unless confirmed platform admin
        if (section.title === 'Platform Administration') {
          if (checkingAdmin || isPlatformAdmin !== true) return null;
          return section;
        }

        // Platform admins bypass permission checks
        if (isPlatformAdmin) return section;

        // Check section-level permission
        if (section.requiredPermission && !hasPermission(section.requiredPermission)) {
          return null;
        }

        // Filter individual items by permission
        const filteredItems = section.items.filter((item: MenuItem) => {
          if (!item.requiredPermission) return true;
          return hasPermission(item.requiredPermission);
        });

        if (filteredItems.length === 0) return null;

        return { ...section, items: filteredItems };
      })
      .filter(Boolean) as MenuSection[];
  }, [isPlatformAdmin, checkingAdmin, hasPermission, permLoading]);

  const showOrgSwitcher = isPlatformAdmin && !isCollapsed;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className={`${isMobile ? 'p-3' : 'p-4'} ${isCollapsed ? 'p-2' : ''}`}>
          <div className="flex items-center justify-between gap-2">
            {!isCollapsed && (
              <>
                {isLoading ? (
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`${isMobile ? 'h-16' : 'h-20'} min-w-[64px] max-w-[200px]`} />
                  </div>
                ) : logoUrl ? (
                  <div className="flex items-center flex-1 min-w-0">
                    <img 
                      src={logoUrl} 
                      alt="Site Logo" 
                      className={`${isMobile ? 'h-16' : 'h-20'} min-w-[64px] max-w-[200px] object-contain`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center flex-1 min-w-0">
                    <h2 className={`font-bold text-foreground truncate ${isMobile ? 'text-lg' : 'text-xl'}`}>
                      {settings.siteName || organization?.name || 'Admin'}
                    </h2>
                  </div>
                )}
              </>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-8 w-8 flex-shrink-0"
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarHeader>
      <TemplateEditingBanner />
      <SidebarContent>
        {showOrgSwitcher && (
          <div className="px-3 pb-2">
            <OrganizationSwitcher />
          </div>
        )}
        
        {filteredMenuItems.map((section) => (
          <AdminSidebarSection 
            key={section.title}
            title={section.title} 
            items={section.items} 
          />
        ))}
      </SidebarContent>
      <AdminSidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
