import React, { useState } from 'react';
import { Plus, Shield, Users, Lock, Settings } from 'lucide-react';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import RoleManagementModal from '@/components/admin/roles/RoleManagementModal';

const RolesPermissionsTab = () => {
  const { userRole, permissions, loading, isAdmin, hasPermission } = useRoleSystem();
  const [roleManagementModalOpen, setRoleManagementModalOpen] = useState(false);

  const canManageRoles = isAdmin() || hasPermission('admin.manage_roles') || hasPermission('users.manage_roles');

  const handleManageRoles = () => {
    setRoleManagementModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Loading roles and permissions...</p>
      </div>
    );
  }

  const showDebugInfo = process.env.NODE_ENV === 'development' && (!userRole || permissions.length === 0);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-end">
        <EnhancedButton 
          onClick={handleManageRoles} 
          variant="gradient"
          icon={<Plus className="h-4 w-4" />}
          disabled={!canManageRoles}
          title={!canManageRoles ? 'You need admin or role management permissions to manage roles' : 'Manage system roles and permissions'}
        >
          Manage Roles
        </EnhancedButton>
      </div>

      {/* Debug info only when there are issues */}
      {showDebugInfo && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription>
            <div className="text-xs space-y-1 mt-2">
              <p>User Role: {userRole?.name || 'None'}</p>
              <p>Is Admin: {isAdmin() ? 'Yes' : 'No'}</p>
              <p>Can Manage Roles: {canManageRoles ? 'Yes' : 'No'}</p>
              <p>Permissions Count: {permissions.length}</p>
              <p>Has admin.manage_roles: {hasPermission('admin.manage_roles') ? 'Yes' : 'No'}</p>
              <p>Has users.manage_roles: {hasPermission('users.manage_roles') ? 'Yes' : 'No'}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Role & Permission Stats */}
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
            <div className="text-2xl font-bold">{isAdmin() ? 'Admin' : 'User'}</div>
            <p className="text-xs text-muted-foreground">
              Current access level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Your Permissions */}
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

      {/* Access Info */}
      {!canManageRoles && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Need More Access?
            </CardTitle>
            <CardDescription>
              Contact an administrator to request additional permissions or role changes.
              You need admin privileges or role management permissions to access role management features.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {canManageRoles && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Role Management Available
            </CardTitle>
            <CardDescription>
              You have permission to manage system roles and permissions. Use the "Manage Roles" button above to access role management features.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Role Management Modal */}
      <RoleManagementModal
        open={roleManagementModalOpen}
        onOpenChange={setRoleManagementModalOpen}
      />
    </div>
  );
};

export default RolesPermissionsTab;