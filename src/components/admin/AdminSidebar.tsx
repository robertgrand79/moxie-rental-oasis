
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
            {/* Site Logo - replace with actual logo when available */}
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <div className="flex flex-col">
              <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'} leading-tight`}>
                Moxie
              </h2>
              <span className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'} leading-tight`}>
                Command Center
              </span>
            </div>
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
