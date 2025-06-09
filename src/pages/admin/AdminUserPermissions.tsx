
import React, { useState } from 'react';
import { UserPlus, Users, Shield, Settings } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserPermissions, UserProfile } from '@/hooks/useUserPermissions';
import UserPermissionsTable from '@/components/admin/users/UserPermissionsTable';
import UserPermissionsModal from '@/components/admin/users/UserPermissionsModal';

const AdminUserPermissions = () => {
  const { users, loading, updateUserPermissions, updateUserRole } = useUserPermissions();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEditPermissions = (user: UserProfile) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleInviteUser = () => {
    console.log('Invite user functionality would go here');
  };

  const activeUsers = users.filter(u => u.role !== 'inactive');
  const adminUsers = users.filter(u => u.role === 'admin');
  const totalPermissions = users.reduce((sum, user) => 
    sum + (user.role === 'admin' ? 18 : Object.values(user.permissions).filter(Boolean).length), 0
  );

  const pageActions = (
    <EnhancedButton 
      onClick={handleInviteUser} 
      variant="gradient"
      icon={<UserPlus className="h-4 w-4" />}
    >
      Invite User
    </EnhancedButton>
  );

  if (loading) {
    return (
      <AdminPageWrapper
        title="User Permissions"
        description="Manage user access and permissions across the platform"
        actions={pageActions}
      >
        <div className="p-8 text-center">
          <p>Loading users...</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="User Permissions"
      description="Manage user access and permissions across the platform"
      actions={pageActions}
    >
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                With permissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Full access users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPermissions}</div>
              <p className="text-xs text-muted-foreground">
                Permissions granted
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Permissions Management</CardTitle>
            <CardDescription>
              Control what each user can access and modify on your platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserPermissionsTable
              users={users}
              onEditPermissions={handleEditPermissions}
              onUpdateRole={updateUserRole}
              onQuickPermissionToggle={updateUserPermissions}
            />
          </CardContent>
        </Card>

        {/* Permissions Modal */}
        <UserPermissionsModal
          user={selectedUser}
          open={modalOpen}
          onClose={handleCloseModal}
          onUpdatePermissions={updateUserPermissions}
        />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminUserPermissions;
