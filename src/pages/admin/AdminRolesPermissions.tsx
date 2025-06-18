
import React, { useState } from 'react';
import { Plus, Shield, Users, Lock } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AdminRolesPermissions = () => {
  const { userRole, permissions, loading, isAdmin } = useRoleSystem();

  const pageActions = (
    <EnhancedButton 
      onClick={() => {}} 
      variant="gradient"
      icon={<Plus className="h-4 w-4" />}
      disabled={!isAdmin}
    >
      Manage Roles
    </EnhancedButton>
  );

  if (loading) {
    return (
      <AdminPageWrapper
        title="Roles & Permissions"
        description="Manage user roles and system permissions"
        actions={pageActions}
      >
        <div className="p-8 text-center">
          <p>Loading roles and permissions...</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Roles & Permissions"
      description="Manage user roles and system permissions"
      actions={pageActions}
    >
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Role</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userRole?.name || 'User'}</div>
              <p className="text-xs text-muted-foreground">
                {userRole?.description || 'Basic user access'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Permissions</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.length}</div>
              <p className="text-xs text-muted-foreground">
                Active permissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Access Level</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isAdmin ? 'Admin' : 'User'}</div>
              <p className="text-xs text-muted-foreground">
                Current access level
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
            <CardDescription>
              Here are the permissions currently assigned to your role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge key={permission.key} variant="secondary" className="text-xs">
                  {permission.name}
                </Badge>
              ))}
              {permissions.length === 0 && (
                <p className="text-muted-foreground">No permissions assigned</p>
              )}
            </div>
          </CardContent>
        </Card>

        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Need More Access?</CardTitle>
              <CardDescription>
                Contact an administrator to request additional permissions or role changes.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminRolesPermissions;
