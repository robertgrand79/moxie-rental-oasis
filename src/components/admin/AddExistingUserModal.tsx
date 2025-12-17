import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import { Search, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AddExistingUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FoundUser {
  id: string;
  email: string;
  full_name: string | null;
  organizations: Array<{ name: string; role: string }>;
  isAlreadyMember: boolean;
}

const AddExistingUserModal = ({ isOpen, onClose, onSuccess }: AddExistingUserModalProps) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { organization } = useCurrentOrganization();

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setFoundUser(null);

    try {
      // Search for user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', searchEmail.trim().toLowerCase())
        .maybeSingle();

      if (profileError) {
        console.error('Error searching for user:', profileError);
        setSearchError('Error searching for user');
        return;
      }

      if (!profile) {
        setSearchError('No user found with this email. Use "Invite User" to create a new account.');
        return;
      }

      // Check if user is already a member of this organization
      const { data: existingMembership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', profile.id)
        .eq('organization_id', organization?.id)
        .maybeSingle();

      if (membershipError && membershipError.code !== 'PGRST116') {
        console.error('Error checking membership:', membershipError);
      }

      // Get user's current organization memberships
      const { data: memberships } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations:organization_id (name)
        `)
        .eq('user_id', profile.id);

      const orgs = memberships?.map(m => ({
        name: (m.organizations as any)?.name || 'Unknown',
        role: m.role
      })) || [];

      setFoundUser({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        organizations: orgs,
        isAlreadyMember: !!existingMembership
      });

    } catch (err) {
      console.error('Unexpected error:', err);
      setSearchError('An unexpected error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddUser = async () => {
    if (!foundUser || !organization?.id || foundUser.isAlreadyMember) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organization.id,
          user_id: foundUser.id,
          role: selectedRole
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already a member',
            description: 'This user is already a member of this organization.',
            variant: 'destructive'
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: 'User added',
        description: `${foundUser.email} has been added to the organization as ${selectedRole}.`
      });

      onSuccess();
      handleClose();

    } catch (err) {
      console.error('Error adding user:', err);
      toast({
        title: 'Error',
        description: 'Failed to add user to organization',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSearchEmail('');
    setFoundUser(null);
    setSearchError(null);
    setSelectedRole('member');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Existing User</DialogTitle>
          <DialogDescription>
            Search for an existing user by email and add them to this organization.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="searchEmail">User Email</Label>
            <div className="flex gap-2">
              <Input
                id="searchEmail"
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="user@example.com"
                disabled={isSearching || isSubmitting}
              />
              <Button 
                type="button" 
                onClick={handleSearch} 
                disabled={isSearching || !searchEmail.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Error */}
          {searchError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted text-muted-foreground">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{searchError}</span>
            </div>
          )}

          {/* Found User */}
          {foundUser && (
            <div className="space-y-4 p-4 rounded-lg border bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{foundUser.full_name || 'Unnamed User'}</p>
                  <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                </div>
                {foundUser.isAlreadyMember ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Already Member
                  </Badge>
                ) : (
                  <Badge variant="outline">Found</Badge>
                )}
              </div>

              {foundUser.organizations.length > 0 && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Current organizations:</p>
                  <div className="flex flex-wrap gap-1">
                    {foundUser.organizations.map((org, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {org.name} ({org.role})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!foundUser.isAlreadyMember && (
                <div className="space-y-2">
                  <Label htmlFor="role">Role in this organization</Label>
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
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {foundUser && !foundUser.isAlreadyMember && (
              <Button 
                onClick={handleAddUser} 
                disabled={isSubmitting}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Adding...' : 'Add to Organization'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddExistingUserModal;
