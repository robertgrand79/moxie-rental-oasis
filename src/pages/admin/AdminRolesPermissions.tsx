import React, { useState } from 'react';
import { Plus, Shield, Users, Lock, Edit, Settings } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import RoleManagementErrorBoundary from '@/components/admin/error-handling/RoleManagementErrorBoundary';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEnhancedRolesPermissions } from '@/hooks/useEnhancedRolesPermissions';
import CreateRoleModal from '@/components/admin/roles/CreateRoleModal';
import EditRoleModal from '@/components/admin/roles/EditRoleModal';
import { SystemRole, SystemPermission } from '@/types/roles';
import { formatErrorForToast } from '@/utils/errorMessages';
import { toast } from '@/hooks/use-toast';

const AdminRolesPermissionsContent = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SystemRole | null>(null);
  
  const {
    roles,
    permissions,
    loading,
    updating,
    createRole,
    updateRole,
    deleteRole,
  } = useEnhancedRolesPermissions();

  const handleEditRole = (role: SystemRole) => {
    setSelectedRole(role);
    setEditModalOpen(true);
  };

  const handlePermissionToggle = async (permissionKey: string) => {
    // For now, we'll just show a toast that this feature is coming soon
    // since permission toggling should be done through proper admin controls
    console.log('Permission toggle for:', permissionKey);
  };

  const handleCreateRoleWithErrorHandling = async (roleData: { name: string; description: string; permissions: string[] }) => {
    try {
      const result = await createRole(roleData);
      if (result) {
        toast({
          title: 'Success',
          description: `Role "${roleData.name}" created successfully.`,
        });
      }
      return result;
    } catch (error) {
      const errorToast = formatErrorForToast(error as Error, {
        operation: 'create',
        resource: 'role'
      });
      toast(errorToast);
      return false;
    }
  };

  const handleUpdateRoleWithErrorHandling = async (roleId: string, updates: any) => {
    try {
      const result = await updateRole(roleId, updates);
      if (result) {
        toast({
          title: 'Success',
          description: 'Role updated successfully.',
        });
      }
      return result;
    } catch (error) {
      const errorToast = formatErrorForToast(error as Error, {
        operation: 'update',
        resource: 'role'
      });
      toast(errorToast);
      return false;
    }
  };

  const handleDeleteRoleWithErrorHandling = async (roleId: string) => {
    try {
      const result = await deleteRole(roleId);
      if (result) {
        toast({
          title: 'Success',
          description: 'Role deleted successfully.',
        });
      }
      return result;
    } catch (error) {
      const errorToast = formatErrorForToast(error as Error, {
        operation: 'delete',
        resource: 'role'
      });
      toast(errorToast);
      return false;
    }
  };

  // Convert enhanced permissions to the format expected by the modals
  const modalPermissions = permissions.map(permission => ({
    id: permission.key,
    name: permission.name,
    description: permission.description || '',
    enabled: permission.is_active
  }));

  // Convert enhanced roles to the format expected by the edit modal
  const convertRoleForModal = (role: SystemRole) => ({
    id: role.id,
    name: role.name,
    description: role.description || '',
    userCount: role.user_count || 0,
    permissions: role.permissions?.map(p => p.key) || []
  });

  const pageActions = (
    <EnhancedButton 
      onClick={() => setCreateModalOpen(true)} 
      variant="gradient"
      icon={<Plus className="h-4 w-4" />}
    >
      Create Role
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
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground">
                System roles configured
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Permissions</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.filter(p => p.is_active).length}</div>
              <p className="text-xs text-muted-foreground">
                Active permissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users Assigned</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roles.reduce((sum, role) => sum + (role.user_count || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total role assignments
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>
                Manage user roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.user_count || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions?.slice(0, 2).map((permission) => (
                            <Badge key={permission.key} variant="secondary" className="text-xs">
                              {permission.key}
                            </Badge>
                          ))}
                          {(role.permissions?.length || 0) > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(role.permissions?.length || 0) - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <EnhancedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                          icon={<Edit className="h-3 w-3" />}
                        >
                          Edit
                        </EnhancedButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permission Settings</CardTitle>
              <CardDescription>
                Configure system-wide permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {permissions.map((permission) => (
                <div key={permission.key} className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">{permission.name}</Label>
                    <div className="text-sm text-muted-foreground">
                      {permission.description}
                    </div>
                  </div>
                  <Switch 
                    checked={permission.is_active}
                    onCheckedChange={() => handlePermissionToggle(permission.key)}
                    disabled={updating}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <CreateRoleModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          permissions={modalPermissions}
          onCreateRole={handleCreateRoleWithErrorHandling}
          loading={updating}
        />

        <EditRoleModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          role={selectedRole ? convertRoleForModal(selectedRole) : null}
          permissions={modalPermissions}
          onUpdateRole={handleUpdateRoleWithErrorHandling}
          onDeleteRole={handleDeleteRoleWithErrorHandling}
          loading={updating}
        />
      </div>
    </AdminPageWrapper>
  );
};

const AdminRolesPermissions = () => {
  return (
    <RoleManagementErrorBoundary>
      <AdminRolesPermissionsContent />
    </RoleManagementErrorBoundary>
  );
};

export default AdminRolesPermissions;
