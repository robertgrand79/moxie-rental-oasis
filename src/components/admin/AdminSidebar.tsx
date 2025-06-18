
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
          <h2 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Moxie Command
          </h2>
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
