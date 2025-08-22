import React, { useState } from 'react';
import { Users, Shield, BarChart3 } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagementTab from '@/components/admin/user-access/UserManagementTab';
import RolesPermissionsTab from '@/components/admin/user-access/RolesPermissionsTab';
import AccessOverviewTab from '@/components/admin/user-access/AccessOverviewTab';

const AdminUserAccessManagement = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <AdminPageWrapper
      title="User & Access Management"
      description="Manage users, roles, permissions, and access control"
    >
      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
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
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminUserAccessManagement;