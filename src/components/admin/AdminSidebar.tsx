
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
import AdminSidebarSection from './sidebar/AdminSidebarSection';
import AdminSidebarFooter from './sidebar/AdminSidebarFooter';
import { coreMenuItems, contentMenuItems, toolsMenuItems } from './sidebar/adminMenuItems';

const AdminSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900">Moxie Command</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <AdminSidebarSection title="Navigation" items={coreMenuItems} />
        <AdminSidebarSection title="Content Management" items={contentMenuItems} />
        <AdminSidebarSection title="Tools & Settings" items={toolsMenuItems} />
      </SidebarContent>
      <AdminSidebarFooter />
    </Sidebar>
  );
};

export default AdminSidebar;
