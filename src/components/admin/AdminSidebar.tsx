import React, { useMemo } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import AdminSidebarItem from './sidebar/AdminSidebarSection';
import AdminSidebarFooter from './sidebar/AdminSidebarFooter';
import { adminMenuItems } from './sidebar/adminMenuItems';
import type { MenuItem } from './sidebar/adminMenuItems';
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
    if (permLoading) return [];

    return adminMenuItems
      .map((item: MenuItem) => {
        // Platform admin only — hide unless confirmed platform admin
        if (item.key === 'platform') {
          if (checkingAdmin || isPlatformAdmin !== true) return null;
          return item;
        }

        // Platform admins bypass all permission checks
        if (isPlatformAdmin) return item;

        // Check top-level permission
        if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
          return null;
        }

        // Filter children by permission
        if (item.children) {
          const filteredChildren = item.children.filter((child) => {
            if (!child.requiredPermission) return true;
            return hasPermission(child.requiredPermission);
          });
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }

        return item;
      })
      .filter(Boolean) as MenuItem[];
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <AdminSidebarItem key={item.key ?? item.title} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <AdminSidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
