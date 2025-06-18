
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Shield, Settings } from 'lucide-react';
import { useEnhancedRolesPermissions } from '@/hooks/useEnhancedRolesPermissions';
import CreateRoleModal from './CreateRoleModal';
import EditRoleModal from './EditRoleModal';
import UserRoleAssignmentModal from './UserRoleAssignmentModal';

interface RoleManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RoleManagementModal = ({ open, onOpenChange }: RoleManagementModalProps) => {
  const { roles, permissions, loading, updating, createRole, updateRole, deleteRole } = useEnhancedRolesPermissions();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userAssignmentModalOpen, setUserAssignmentModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setEditModalOpen(true);
  };

  const handleAssignUsers = (role: any) => {
    setSelectedRole(role);
    setUserAssignmentModalOpen(true);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="p-8 text-center">
            <p>Loading role management...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Management
            </DialogTitle>
            <DialogDescription>
              Manage system roles and permissions
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="roles" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="flex-1 flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">System Roles</h3>
                <EnhancedButton
                  onClick={() => setCreateModalOpen(true)}
                  variant="gradient"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Create Role
                </EnhancedButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
                {roles.map((role) => (
                  <Card key={role.id} className="h-fit">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{role.name}</CardTitle>
                        <Badge variant={role.is_system_role ? "default" : "secondary"}>
                          {role.is_system_role ? "System" : "Custom"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description || 'No description'}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {role.user_count || 0} users
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          {role.permissions?.length || 0} permissions
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <EnhancedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRole(role)}
                          className="flex-1"
                        >
                          Edit
                        </EnhancedButton>
                        <EnhancedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignUsers(role)}
                          className="flex-1"
                        >
                          Assign Users
                        </EnhancedButton>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="flex-1 flex flex-col space-y-4">
              <h3 className="text-lg font-semibold">System Permissions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto">
                {permissions.map((permission) => (
                  <Card key={permission.id} className="h-fit">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{permission.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {permission.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                          {permission.key}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CreateRoleModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        permissions={permissions.map(p => ({ id: p.key, name: p.name, description: p.description || '', enabled: p.is_active }))}
        onCreateRole={createRole}
        loading={updating}
      />

      <EditRoleModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        role={selectedRole ? {
          id: selectedRole.id,
          name: selectedRole.name,
          description: selectedRole.description || '',
          userCount: selectedRole.user_count || 0,
          permissions: selectedRole.permissions?.map((p: any) => p.key) || []
        } : null}
        permissions={permissions.map(p => ({ id: p.key, name: p.name, description: p.description || '', enabled: p.is_active }))}
        onUpdateRole={updateRole}
        onDeleteRole={deleteRole}
        loading={updating}
      />

      <UserRoleAssignmentModal
        open={userAssignmentModalOpen}
        onOpenChange={setUserAssignmentModalOpen}
        role={selectedRole}
      />
    </>
  );
};

export default RoleManagementModal;
