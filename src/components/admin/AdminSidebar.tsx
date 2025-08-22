
import React from 'react';
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

const AdminSidebar = () => {
  const isMobile = useIsMobile();
  const { settings } = useSimplifiedSiteSettings();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-3">
            {/* Site Logo - conditionally render logo or fallback to site name */}
            {settings.siteLogo ? (
              <div className="flex items-center">
                <img 
                  src={settings.siteLogo} 
                  alt="Site Logo" 
                  className={`${isMobile ? 'h-8' : 'h-10'} w-auto max-w-[150px] object-contain`}
                  onError={(e) => {
                    console.log('Logo failed to load:', settings.siteLogo);
                    // Hide the image if it fails to load and show fallback
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center">
                <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  {settings.siteName || 'Moxie'}
                </h2>
              </div>
            )}
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {adminMenuItems.map((section) => (
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
