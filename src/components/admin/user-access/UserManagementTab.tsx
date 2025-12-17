import React, { useState } from 'react';
import { UserPlus, Mail, Shield, MoreHorizontal, Users, Edit, Trash2, Search, Download, Link } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useUserManagement } from '@/hooks/useUserManagement';
import UserInviteModal from '@/components/admin/UserInviteModal';
import UserProfileModal from '@/components/admin/UserProfileModal';
import UserPermissionDiagnostics from '@/components/admin/UserPermissionDiagnostics';
import AddExistingUserModal from '@/components/admin/AddExistingUserModal';
import { useAuth } from '@/contexts/AuthContext';

const UserManagementTab = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddExistingUserModalOpen, setIsAddExistingUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const { 
    users, 
    loading, 
    error, 
    fetchUsers,
    updateUserProfile,
    updateUserRole, 
    deleteUser, 
    deactivateUser,
    inviteUser,
    searchUsers,
    bulkUpdateUserRoles
  } = useUserManagement();
  const { user: currentUser } = useAuth();

  const filteredUsers = searchUsers(searchQuery);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await deleteUser(userId);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    await deactivateUser(userId);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateUserRole(userId, newRole);
  };

  const handleBulkRoleUpdate = async (role: string) => {
    if (selectedUsers.length === 0) return;
    await bulkUpdateUserRoles(selectedUsers, role);
    setSelectedUsers([]);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Email', 'Name', 'Role', 'Status', 'Created At'],
      ...filteredUsers.map(user => [
        user.email,
        user.full_name || '',
        user.role,
        user.status,
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading users: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const activeUsers = users.filter(u => u.status === 'active');
  const adminUsers = users.filter(u => u.organization_role === 'admin' || u.organization_role === 'owner');

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Bulk Actions ({selectedUsers.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkRoleUpdate('admin')}>
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkRoleUpdate('user')}>
                    Make User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsAddExistingUserModalOpen(true)}
          >
            <Link className="h-4 w-4 mr-2" />
            Add Existing User
          </Button>
          <EnhancedButton
            onClick={() => setIsInviteModalOpen(true)}
            variant="gradient"
            icon={<UserPlus className="h-4 w-4" />}
          >
            Invite User
          </EnhancedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.full_name || 'Unnamed User'}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.organization_role === 'owner' ? 'default' : user.organization_role === 'admin' ? 'secondary' : 'outline'}>
                        {user.organization_role || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
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
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </DropdownMenuItem>
                          {user.status === 'active' && (
                            <DropdownMenuItem onClick={() => handleDeactivateUser(user.id)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
                          {user.id !== currentUser?.id && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Permission Diagnostics */}
      <UserPermissionDiagnostics />

      {/* Modals */}
      <UserInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={inviteUser}
      />
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUser}
        onUpdate={updateUserProfile}
      />
      <AddExistingUserModal
        isOpen={isAddExistingUserModalOpen}
        onClose={() => setIsAddExistingUserModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UserManagementTab;