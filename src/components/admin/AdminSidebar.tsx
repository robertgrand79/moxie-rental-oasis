
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

const AdminSidebar = () => {
  const isMobile = useIsMobile();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-3">
            {/* Site Logo - conditionally render logo or fallback to site name */}
            {/* TODO: Replace with actual logo URL from site settings when available */}
            {false ? ( // Change to check for actual logo URL
              <img 
                src="/path/to/logo.png" 
                alt="Site Logo" 
                className={`${isMobile ? 'h-8' : 'h-10'} w-auto`}
              />
            ) : (
              <div className="flex items-center">
                <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                  Moxie
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
