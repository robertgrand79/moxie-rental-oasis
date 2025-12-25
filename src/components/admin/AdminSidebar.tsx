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
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';

const AdminSidebar = () => {
  const isMobile = useIsMobile();
  const { settings } = useSimplifiedSiteSettings();
  const { organization } = useCurrentOrganization();
  const { isPlatformAdmin } = usePlatformAdmin();
  const { state, toggleSidebar } = useSidebar();
  
  const isCollapsed = state === 'collapsed';
  const logoUrl = settings.siteLogo || organization?.logo_url;

  // Filter menu items based on platform admin status
  const filteredMenuItems = useMemo(() => {
    return adminMenuItems
      .map(section => {
        if (section.title === 'Platform Administration') {
          const filteredItems = section.items.filter(item => {
            if (item.title === 'Super Admin Panel') {
              return isPlatformAdmin === true;
            }
            return true;
          });
          
          if (filteredItems.length === 0) return null;
          return { ...section, items: filteredItems };
        }
        return section;
      })
      .filter(Boolean) as typeof adminMenuItems;
  }, [isPlatformAdmin]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className={`${isMobile ? 'p-3' : 'p-4'} ${isCollapsed ? 'p-2' : ''}`}>
          <div className="flex items-center justify-between gap-2">
            {/* Logo/Name - hidden when collapsed */}
            {!isCollapsed && (
              <>
                {logoUrl ? (
                              <div className="flex items-center flex-1 min-w-0">
                    <img 
                      src={logoUrl} 
                      alt="Site Logo" 
                      className={`${isMobile ? 'h-10' : 'h-12'} w-auto max-w-[160px] object-contain`}
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
            
            {/* Toggle button */}
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
      <SidebarContent>
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
