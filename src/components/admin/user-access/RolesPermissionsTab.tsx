import React, { useState, useMemo } from 'react';
import { Plus, Shield, Users, Lock, Settings, Edit, UserPlus, AlertCircle } from 'lucide-react';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useEnhancedRolesPermissions } from '@/hooks/useEnhancedRolesPermissions';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import CreateRoleModal from '@/components/admin/roles/CreateRoleModal';
import EditRoleModal from '@/components/admin/roles/EditRoleModal';
import UserRoleAssignmentModal from '@/components/admin/roles/UserRoleAssignmentModal';

const RolesPermissionsTab = () => {
  const { userRole, permissions: userPermissions, loading: roleSystemLoading, isAdmin, hasPermission } = useRoleSystem();
  const { roles, permissions, loading, updating, createRole, updateRole, deleteRole } = useEnhancedRolesPermissions();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userAssignmentModalOpen, setUserAssignmentModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const canManageRoles = isAdmin() || hasPermission('admin.manage_roles') || hasPermission('users.manage_roles');

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, permission) => {
      const category = permission.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);
  }, [permissions]);

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setEditModalOpen(true);
  };

  const handleAssignUsers = (role: any) => {
    setSelectedRole(role);
    setUserAssignmentModalOpen(true);
  };

  if (loading || roleSystemLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  const hasDataIssues = roles.length === 0 && permissions.length === 0;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
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
            <div className="text-2xl font-bold">{userPermissions.length}</div>
            <p className="text-xs text-muted-foreground">Active permissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Level</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isAdmin() ? 'Admin' : 'User'}</div>
            <p className="text-xs text-muted-foreground">Current access level</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Issues Alert */}
      {hasDataIssues && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Loading Issue</AlertTitle>
          <AlertDescription>
            Unable to load roles and permissions. Please try refreshing the page or contact your administrator.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: System Roles (3/5 width) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Roles
            </h3>
            {canManageRoles && (
              <EnhancedButton
                onClick={() => setCreateModalOpen(true)}
                variant="gradient"
                size="sm"
                icon={<Plus className="h-4 w-4" />}
                disabled={hasDataIssues}
              >
                Create Role
              </EnhancedButton>
            )}
          </div>

          {roles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {hasDataIssues ? 'Unable to load roles' : 'No roles found. Create your first role to get started.'}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <Card key={role.id} className="h-fit">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{role.name}</CardTitle>
                      <Badge variant={role.is_system_role ? "default" : "secondary"}>
                        {role.is_system_role ? "System" : "Custom"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {role.description || 'No description'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {role.user_count || 0} users
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        {role.permissions?.length || 0} permissions
                      </span>
                    </div>
                    
                    {canManageRoles && (
                      <div className="flex gap-2">
                        <EnhancedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRole(role)}
                          className="flex-1"
                          icon={<Edit className="h-3 w-3" />}
                        >
                          Edit
                        </EnhancedButton>
                        <EnhancedButton
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignUsers(role)}
                          className="flex-1"
                          icon={<UserPlus className="h-3 w-3" />}
                        >
                          Assign
                        </EnhancedButton>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: Permissions Reference (2/5 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Available Permissions ({permissions.length})
            </h3>
          </div>

          <Card>
            <ScrollArea className="h-[500px]">
              <CardContent className="p-4 space-y-4">
                {Object.keys(groupedPermissions).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {hasDataIssues ? 'Unable to load permissions' : 'No permissions found'}
                  </p>
                ) : (
                  Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-primary border-b pb-1">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {perms.map((permission) => (
                          <div
                            key={permission.id}
                            className="p-2 rounded-md bg-muted/50 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{permission.name}</span>
                            </div>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            )}
                            <code className="text-xs font-mono text-muted-foreground bg-background px-1.5 py-0.5 rounded">
                              {permission.key}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Your Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Your Permissions
          </CardTitle>
          <CardDescription>
            Permissions currently assigned to your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {userPermissions.map((permission) => (
              <Badge key={permission.key} variant="secondary" className="text-xs">
                {permission.name}
              </Badge>
            ))}
            {userPermissions.length === 0 && (
              <p className="text-muted-foreground text-sm">No permissions assigned</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Access Info */}
      {!canManageRoles && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-5 w-5" />
              Need More Access?
            </CardTitle>
            <CardDescription>
              Contact an administrator to request additional permissions or role changes.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Modals for Create/Edit/Assign */}
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
    </div>
  );
};

export default RolesPermissionsTab;
