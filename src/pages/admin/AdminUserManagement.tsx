
import React, { useState } from 'react';
import { UserPlus, Mail, Shield, MoreHorizontal, Users, Edit, Trash2, Search, Download } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
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
import { useAuth } from '@/contexts/AuthContext';

const AdminUserManagement = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const { 
    users, 
    loading, 
    error, 
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

  const handleDeactivateUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot deactivate your own account');
      return;
    }
    
    if (confirm('Are you sure you want to deactivate this user? They will lose access but their data will be preserved.')) {
      await deactivateUser(userId);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }
    
    if (confirm('Are you sure you want to permanently delete this user? This action cannot be undone and will remove all their data.')) {
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

  const handleBulkRoleUpdate = async (newRole: string) => {
    if (selectedUsers.length === 0) return;
    
    if (selectedUsers.includes(currentUser?.id || '')) {
      alert('Cannot change your own role in bulk operation');
      return;
    }
    
    await bulkUpdateUserRoles(selectedUsers, newRole);
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
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
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
      {selectedUsers.length > 0 && (
        <div className="flex gap-2">
          <Button 
            onClick={() => handleBulkRoleUpdate('admin')} 
            variant="outline"
            size="sm"
          >
            Make Admin ({selectedUsers.length})
          </Button>
          <Button 
            onClick={() => handleBulkRoleUpdate('user')} 
            variant="outline"
            size="sm"
          >
            Make User ({selectedUsers.length})
          </Button>
        </div>
      )}
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

  const activeUsers = users.filter(u => u.status === 'active');
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
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  View and manage all system users
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
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
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
                      <Badge 
                        variant="outline"
                        className={getStatusColor(user.status)}
                      >
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
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
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
                            onClick={() => handleDeactivateUser(user.id)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deactivate user
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete user permanently
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

        {/* User Permission Diagnostics */}
        <UserPermissionDiagnostics />
      </div>

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
    </AdminPageWrapper>
  );
};

export default AdminUserManagement;
