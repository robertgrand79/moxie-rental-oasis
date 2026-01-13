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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Search, UserPlus, Building2, Trash2, Users, ChevronDown, ChevronRight, LayoutList, FolderTree } from 'lucide-react';
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

type ViewMode = 'grouped' | 'flat';

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
  const [filterOrgId, setFilterOrgId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  // Expand all organizations by default when data loads
  useEffect(() => {
    if (organizations.length > 0 && expandedOrgs.size === 0) {
      setExpandedOrgs(new Set(organizations.map(o => o.id).concat(['no-org'])));
    }
  }, [organizations]);

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

  // Filter users based on search and organization filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterOrgId === 'all') return matchesSearch;
    if (filterOrgId === 'no-org') return matchesSearch && user.organizations.length === 0;
    return matchesSearch && user.organizations.some(o => o.id === filterOrgId);
  });

  // Group users by organization for grouped view
  const groupedUsers = React.useMemo(() => {
    const groups: Record<string, { org: Organization | null; users: PlatformUser[] }> = {};
    
    // Initialize groups for each organization
    organizations.forEach(org => {
      groups[org.id] = { org, users: [] };
    });
    groups['no-org'] = { org: null, users: [] };

    // Group filtered users
    filteredUsers.forEach(user => {
      if (user.organizations.length === 0) {
        groups['no-org'].users.push(user);
      } else {
        user.organizations.forEach(org => {
          if (groups[org.id]) {
            // Avoid duplicates in same org
            if (!groups[org.id].users.some(u => u.id === user.id)) {
              groups[org.id].users.push(user);
            }
          }
        });
      }
    });

    // Filter out empty groups unless we're showing all
    return Object.entries(groups)
      .filter(([_, group]) => group.users.length > 0)
      .sort((a, b) => {
        // Put "no-org" at the end
        if (a[0] === 'no-org') return 1;
        if (b[0] === 'no-org') return -1;
        return (a[1].org?.name || '').localeCompare(b[1].org?.name || '');
      });
  }, [filteredUsers, organizations]);

  const openAssignModal = (user: PlatformUser) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  const toggleOrgExpanded = (orgId: string) => {
    setExpandedOrgs(prev => {
      const next = new Set(prev);
      if (next.has(orgId)) {
        next.delete(orgId);
      } else {
        next.add(orgId);
      }
      return next;
    });
  };

  const renderUserRow = (user: PlatformUser, showOrgColumn: boolean = true) => (
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
      {showOrgColumn && (
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
      )}
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
  );

  const renderGroupedView = () => (
    <div className="space-y-4">
      {groupedUsers.map(([orgId, group]) => {
        const isExpanded = expandedOrgs.has(orgId);
        const orgName = group.org?.name || 'No Organization';
        
        return (
          <Collapsible key={orgId} open={isExpanded} onOpenChange={() => toggleOrgExpanded(orgId)}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-base">{orgName}</CardTitle>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {group.users.length} user{group.users.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.users.map((user) => {
                          const membershipInThisOrg = user.organizations.find(o => o.id === orgId);
                          return (
                            <TableRow key={`${orgId}-${user.id}`}>
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
                                {membershipInThisOrg ? (
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline">{membershipInThisOrg.role}</Badge>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 text-destructive hover:text-destructive"
                                      onClick={() => handleRemoveFromOrg(user.id, membershipInThisOrg.membership_id, orgName)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground italic">—</span>
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
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
      {groupedUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm || filterOrgId !== 'all' ? 'No users match your filters' : 'No users found'}
        </div>
      )}
    </div>
  );

  const renderFlatView = () => (
    <Card>
      <CardHeader>
        <CardTitle>All Platform Users</CardTitle>
        <CardDescription>
          Manage user organization memberships across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredUsers.length > 0 ? (
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
                {filteredUsers.map((user) => renderUserRow(user))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm || filterOrgId !== 'all' ? 'No users match your filters' : 'No users found'}
          </div>
        )}
      </CardContent>
    </Card>
  );

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

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterOrgId} onValueChange={setFilterOrgId}>
          <SelectTrigger className="w-[200px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            <SelectItem value="no-org">No Organization</SelectItem>
            {organizations.map(org => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grouped' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grouped')}
            className="h-8"
          >
            <FolderTree className="h-4 w-4 mr-1" />
            Grouped
          </Button>
          <Button
            variant={viewMode === 'flat' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('flat')}
            className="h-8"
          >
            <LayoutList className="h-4 w-4 mr-1" />
            Flat
          </Button>
        </div>

        <Badge variant="outline">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Users Display */}
      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : viewMode === 'grouped' ? (
        renderGroupedView()
      ) : (
        renderFlatView()
      )}

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
