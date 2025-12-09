import React, { useMemo } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
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
    <Sidebar>
      <SidebarHeader>
        <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <div className="flex items-center">
                <img 
                  src={logoUrl} 
                  alt="Site Logo" 
                  className={`${isMobile ? 'h-8' : 'h-10'} w-auto max-w-[150px] object-contain`}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {settings.siteName || organization?.name || 'Admin'}
                </h2>
              </div>
            )}
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
