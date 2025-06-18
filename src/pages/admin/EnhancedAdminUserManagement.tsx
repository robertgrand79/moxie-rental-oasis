
import React, { useState } from 'react';
import { UserPlus, Mail, Shield, MoreHorizontal, Users, Edit, Trash2, Search } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useEnhancedUserManagement } from '@/hooks/user-management/useEnhancedUserManagement';
import EnhancedUserInviteModal from '@/components/admin/user-management/EnhancedUserInviteModal';
import UserProfileModal from '@/components/admin/UserProfileModal';
import UserRoleManager from '@/components/admin/user-management/UserRoleManager';
import { useAuth } from '@/contexts/AuthContext';

const EnhancedAdminUserManagement = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    users, 
    availableRoles,
    loading, 
    error, 
    updateUserProfile,
    assignRoleToUser,
    removeRoleFromUser,
    inviteUser,
    searchUsers
  } = useEnhancedUserManagement();
  const { user: currentUser } = useAuth();

  const filteredUsers = searchUsers(searchQuery);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const pageActions = (
    <div className="flex gap-2">
      <EnhancedButton 
        onClick={() => setIsInviteModalOpen(true)} 
        variant="gradient"
        icon={<UserPlus className="h-4 w-4" />}
      >
        Invite User
      </EnhancedButton>
    </div>
  );

  if (loading) {
    return (
      <AdminPageWrapper
        title="Enhanced User Management"
        description="Manage system users with advanced role-based permissions"
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
        title="Enhanced User Management"
        description="Manage system users with advanced role-based permissions"
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

  const activeUsers = users.filter(u => u.status === 'active');
  const adminUsers = users.filter(u => u.roles.some(role => role.name === 'Admin' || role.name === 'Super Admin'));

  return (
    <AdminPageWrapper
      title="Enhanced User Management"
      description="Manage system users with advanced role-based permissions"
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
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  View and manage all system users with enhanced role management
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'No name set'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <UserRoleManager
                        userId={user.id}
                        currentRoles={user.roles}
                        availableRoles={availableRoles}
                        onAssignRole={assignRoleToUser}
                        onRemoveRole={removeRoleFromUser}
                        disabled={user.id === currentUser?.id}
                      />
                    </TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.last_login_at 
                        ? new Date(user.last_login_at).toLocaleDateString()
                        : 'Never'
                      }
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
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit user
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

      <EnhancedUserInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        availableRoles={availableRoles}
        onInvite={inviteUser}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUser}
        onUpdate={updateUserProfile}
      />
    </AdminPageWrapper>
  );
};

export default EnhancedAdminUserManagement;
