
import React, { useState } from 'react';
import { UserPlus, Mail, Shield, MoreHorizontal, Users, Edit, Trash2 } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUserManagement } from '@/hooks/useUserManagement';
import UserInviteModal from '@/components/admin/UserInviteModal';
import { useAuth } from '@/contexts/AuthContext';

const AdminUserManagement = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { users, loading, error, updateUserRole, deleteUser, inviteUser } = useUserManagement();
  const { user: currentUser } = useAuth();

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
    // TODO: Implement edit user functionality
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUser(userId);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot change your own role');
      return;
    }
    
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateUserRole(userId, newRole);
  };

  const pageActions = (
    <EnhancedButton 
      onClick={() => setIsInviteModalOpen(true)} 
      variant="gradient"
      icon={<UserPlus className="h-4 w-4" />}
    >
      Invite User
    </EnhancedButton>
  );

  if (loading) {
    return (
      <AdminPageWrapper
        title="User Management"
        description="Manage system users, invitations, and access controls"
        actions={pageActions}
      >
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </AdminPageWrapper>
    );
  }

  if (error) {
    return (
      <AdminPageWrapper
        title="User Management"
        description="Manage system users, invitations, and access controls"
        actions={pageActions}
      >
        <div className="p-8">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">Error loading users: {error}</p>
            </CardContent>
          </Card>
        </div>
      </AdminPageWrapper>
    );
  }

  const activeUsers = users.filter(u => u.role !== 'inactive');
  const adminUsers = users.filter(u => u.role === 'admin');

  return (
    <AdminPageWrapper
      title="User Management"
      description="Manage system users, invitations, and access controls"
      actions={pageActions}
    >
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered accounts
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
                Currently active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Administrative access
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View and manage all system users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'No name set'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleRoleChange(user.id, user.role)}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit user
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, user.role)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Toggle role
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <UserInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={inviteUser}
      />
    </AdminPageWrapper>
  );
};

export default AdminUserManagement;
