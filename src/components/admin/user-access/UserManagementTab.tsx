import React, { useState } from 'react';
import { UserPlus, Mail, Shield, MoreHorizontal, Users, Edit, Trash2, Search, Download, Link } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUserManagement } from '@/hooks/useUserManagement';
import UserInviteModal from '@/components/admin/UserInviteModal';
import UserProfileModal from '@/components/admin/UserProfileModal';

import AddExistingUserModal from '@/components/admin/AddExistingUserModal';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';

const TEAM_ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'cleaner', label: 'Cleaner' },
  { value: 'view_only', label: 'View Only' },
];

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case 'owner': return 'default';
    case 'manager': return 'secondary';
    case 'staff': return 'outline';
    case 'maintenance': case 'cleaner': return 'outline';
    default: return 'outline';
  }
};

const UserManagementTab = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddExistingUserModalOpen, setIsAddExistingUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState<{ id: string; name: string } | null>(null);
  
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
  const { canManageTeam, isOwner } = useTeamPermissions();
  const { organization } = useCurrentOrganization();

  const filteredUsers = searchUsers(searchQuery);

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!organization?.id) return;
    
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', organization.id);

    if (error) {
      toast.error('Failed to remove member');
      console.error(error);
    } else {
      toast.success('Member removed from organization');
      fetchUsers();
    }
    setRemoveConfirm(null);
  };

  const handleTeamRoleChange = async (userId: string, newTeamRole: string) => {
    if (!organization?.id) return;

    const { data, error } = await supabase
      .from('organization_members')
      .update({ 
        team_role: newTeamRole as any,
        role: newTeamRole === 'owner' ? 'owner' : newTeamRole === 'manager' ? 'admin' : 'member',
      })
      .eq('user_id', userId)
      .eq('organization_id', organization.id)
      .select();

    if (error) {
      toast.error('Failed to update role: ' + error.message);
      console.error(error);
    } else if (!data || data.length === 0) {
      toast.error('Permission denied: unable to update role');
    } else {
      toast.success(`Role updated to ${newTeamRole}`);
      fetchUsers();
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Email', 'Name', 'Role', 'Team Role', 'Status', 'Created At'],
      ...filteredUsers.map((user: any) => [
        user.email,
        user.full_name || '',
        user.role,
        user.team_role || '',
        user.status,
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-members.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Error loading team members: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const activeUsers = users.filter((u: any) => u.status === 'active');
  const ownerCount = users.filter((u: any) => u.organization_role === 'owner' || u.team_role === 'owner').length;
  const fieldCrew = users.filter((u: any) => u.team_role === 'maintenance' || u.team_role === 'cleaner').length;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canManageTeam && (
            <>
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
                Invite Member
              </EnhancedButton>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">{activeUsers.length} active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Owners & Managers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ownerCount}</div>
            <p className="text-xs text-muted-foreground">Full admin access</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Field Crew</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldCrew}</div>
            <p className="text-xs text-muted-foreground">Maintenance & Cleaners</p>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your organization's team members, roles, and access levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Team Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  {canManageTeam && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((member: any) => {
                  const displayRole = member.team_role || member.organization_role || member.role || 'staff';
                  const isSelf = member.id === currentUser?.id;
                  
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{member.full_name || 'Unnamed'}</span>
                          <span className="text-sm text-muted-foreground">{member.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canManageTeam && !isSelf ? (
                          <Select
                            value={displayRole}
                            onValueChange={(val) => handleTeamRoleChange(member.id, val)}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TEAM_ROLE_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={roleBadgeVariant(displayRole)}>
                            {displayRole}
                            {isSelf && ' (you)'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(member.created_at).toLocaleDateString()}
                      </TableCell>
                      {canManageTeam && (
                        <TableCell className="text-right">
                          {!isSelf && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUser(member)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Profile
                                </DropdownMenuItem>
                                {member.status === 'active' && (
                                  <DropdownMenuItem onClick={() => deactivateUser(member.id)}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => setRemoveConfirm({ id: member.id, name: member.full_name || member.email })}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove from Org
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


      {/* Remove Confirmation */}
      <AlertDialog open={!!removeConfirm} onOpenChange={() => setRemoveConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{removeConfirm?.name}</strong> from your organization. They will lose all access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeConfirm && handleRemoveMember(removeConfirm.id)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
