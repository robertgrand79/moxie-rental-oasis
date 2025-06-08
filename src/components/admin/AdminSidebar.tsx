
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

  // Extract menu items by sections
  const dashboardSection = adminMenuItems.find(section => section.title === "Dashboard");
  const propertiesSection = adminMenuItems.find(section => section.title === "Properties");
  const contentSection = adminMenuItems.find(section => section.title === "Content & Marketing");
  const usersSection = adminMenuItems.find(section => section.title === "Users & Roles");
  const settingsSection = adminMenuItems.find(section => section.title === "Settings");

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
        {dashboardSection && (
          <AdminSidebarSection 
            title={dashboardSection.title} 
            items={convertMenuItems(dashboardSection.items)} 
          />
        )}
        {propertiesSection && (
          <AdminSidebarSection 
            title={propertiesSection.title} 
            items={convertMenuItems(propertiesSection.items)} 
          />
        )}
        {contentSection && (
          <AdminSidebarSection 
            title={contentSection.title} 
            items={convertMenuItems(contentSection.items)} 
          />
        )}
        {usersSection && (
          <AdminSidebarSection 
            title={usersSection.title} 
            items={convertMenuItems(usersSection.items)} 
          />
        )}
        {settingsSection && (
          <AdminSidebarSection 
            title={settingsSection.title} 
            items={convertMenuItems(settingsSection.items)} 
          />
        )}
      </SidebarContent>
      <AdminSidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
