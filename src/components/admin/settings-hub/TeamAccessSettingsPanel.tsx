import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, BarChart3, Bell } from 'lucide-react';
import UserManagementTab from '@/components/admin/user-access/UserManagementTab';
import RolesPermissionsTab from '@/components/admin/user-access/RolesPermissionsTab';
import AccessOverviewTab from '@/components/admin/user-access/AccessOverviewTab';
import NotificationPreferences from '@/components/admin/notifications/NotificationPreferences';

const TeamAccessSettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Access Overview
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UserManagementTab />
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6">
          <RolesPermissionsTab />
        </TabsContent>
        
        <TabsContent value="overview" className="mt-6">
          <AccessOverviewTab />
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamAccessSettingsPanel;
