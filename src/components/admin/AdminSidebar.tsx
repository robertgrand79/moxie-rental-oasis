
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import AdminSidebarSection from './sidebar/AdminSidebarSection';
import AdminSidebarFooter from './sidebar/AdminSidebarFooter';
import { coreMenuItems, contentMenuItems, toolsMenuItems } from './sidebar/adminMenuItems';

const AdminSidebar = () => {
  const location = useLocation();

  // Update menu items with active state based on current path
  const updateMenuItemsWithActiveState = (items: any[]) => {
    return items.map(item => ({
      ...item,
      isActive: location.pathname === item.url || location.pathname.startsWith(item.url + '/')
    }));
  };

  const activeCoreMenuItems = updateMenuItemsWithActiveState(coreMenuItems);
  const activeContentMenuItems = updateMenuItemsWithActiveState(contentMenuItems);
  const activeToolsMenuItems = updateMenuItemsWithActiveState(toolsMenuItems);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold text-gray-900">Moxie Command</h2>
          <SidebarTrigger className="h-6 w-6" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <AdminSidebarSection title="Navigation" items={activeCoreMenuItems} />
        <AdminSidebarSection title="Content Management" items={activeContentMenuItems} />
        <AdminSidebarSection title="Tools & Settings" items={activeToolsMenuItems} />
      </SidebarContent>
      <AdminSidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
