import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Search, UserPlus, Building2, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';

interface PlatformUser {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  created_at: string;
  organizations: Array<{
    id: string;
    membership_id: string;
    name: string;
    role: string;
  }>;
}

interface Organization {
  id: string;
  name: string;
}

const PlatformUsersTab = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, status, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all organization memberships
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_members')
        .select(`
          id,
          user_id,
          role,
          organizations:organization_id (id, name)
        `);

      if (membershipsError) throw membershipsError;

      // Fetch all organizations for the assign dropdown
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (orgsError) throw orgsError;

      setOrganizations(orgs || []);

      // Map users with their organizations
      const usersWithOrgs: PlatformUser[] = (profiles || []).map(profile => {
        const userMemberships = memberships?.filter(m => m.user_id === profile.id) || [];
        return {
          ...profile,
          organizations: userMemberships.map(m => ({
            id: (m.organizations as any)?.id,
            membership_id: m.id,
            name: (m.organizations as any)?.name || 'Unknown',
            role: m.role
          }))
        };
      });

      setUsers(usersWithOrgs);

    } catch (err) {
      console.error('Error fetching users:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrg = async () => {
    if (!selectedUser || !selectedOrgId) return;

    setIsSubmitting(true);
    try {
      // Check if already a member
      const existing = selectedUser.organizations.find(o => o.id === selectedOrgId);
      if (existing) {
        toast({
          title: 'Already a member',
          description: 'This user is already a member of the selected organization.',
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: selectedOrgId,
          user_id: selectedUser.id,
          role: selectedRole
        });

      if (error) throw error;

      toast({
        title: 'User assigned',
        description: `${selectedUser.email} has been added to the organization.`
      });

      setIsAssignModalOpen(false);
      setSelectedOrgId('');
      setSelectedRole('member');
      fetchData();

    } catch (err) {
      console.error('Error assigning user:', err);
      toast({
        title: 'Error',
        description: 'Failed to assign user to organization',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFromOrg = async (userId: string, membershipId: string, orgName: string) => {
    if (!window.confirm(`Remove this user from ${orgName}?`)) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;

      toast({
        title: 'User removed',
        description: `User has been removed from ${orgName}.`
      });

      fetchData();

    } catch (err) {
      console.error('Error removing user:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove user from organization',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAssignModal = (user: PlatformUser) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">With Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.organizations.length > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Without Organizations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(u => u.organizations.length === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Platform Users</CardTitle>
          <CardDescription>
            Manage user organization memberships across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Organizations</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.organizations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.organizations.map((org) => (
                              <div key={org.membership_id} className="flex items-center gap-1">
                                <Badge variant="outline" className="text-xs">
                                  {org.name} ({org.role})
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveFromOrg(user.id, org.membership_id, org.name)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            No organization
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAssignModal(user)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign Org
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No users match your search' : 'No users found'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Organization Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign to Organization</DialogTitle>
            <DialogDescription>
              Add {selectedUser?.email} to an organization
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations
                    .filter(org => !selectedUser?.organizations.some(o => o.id === org.id))
                    .map(org => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAssignModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignOrg}
                disabled={!selectedOrgId || isSubmitting}
              >
                {isSubmitting ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformUsersTab;
