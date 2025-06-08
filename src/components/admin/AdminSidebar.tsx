
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
import AdminSidebarSection from './sidebar/AdminSidebarSection';
import AdminSidebarFooter from './sidebar/AdminSidebarFooter';
import { adminMenuItems } from './sidebar/adminMenuItems';

const AdminSidebar = () => {
  const location = useLocation();

  // Convert menu items to the format expected by AdminSidebarSection
  const convertMenuItems = (items: any[] = []) => {
    return items.map(item => ({
      title: item.title,
      url: item.href,
      icon: item.icon,
      color: "text-gray-600"
    }));
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900">Moxie Command</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {adminMenuItems.map((section) => (
          <AdminSidebarSection 
            key={section.title}
            title={section.title} 
            items={convertMenuItems(section.items)} 
          />
        ))}
      </SidebarContent>
      <AdminSidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
