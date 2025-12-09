
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Users, X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface TaskAssignmentFormProps {
  taskId?: string;
  selectedUserIds: string[];
  onUserSelectionChange: (userIds: string[]) => void;
}

const TaskAssignmentForm = ({ taskId, selectedUserIds, onUserSelectionChange }: TaskAssignmentFormProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  useEffect(() => {
    if (organization?.id) {
      fetchUsers();
    }
  }, [organization?.id]);

  const fetchUsers = async () => {
    if (!organization?.id) return;
    
    try {
      // Fetch organization members with their profile info (organization-scoped)
      const { data, error } = await supabase
        .from('organization_members')
        .select('user_id, profiles!inner(id, email, full_name)')
        .eq('organization_id', organization.id)
        .order('profiles(full_name)', { ascending: true });

      if (error) throw error;
      
      // Map the joined data to User interface
      const mappedUsers: User[] = (data || []).map(member => ({
        id: (member.profiles as any).id,
        email: (member.profiles as any).email,
        full_name: (member.profiles as any).full_name,
      }));
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];
    
    onUserSelectionChange(newSelection);
  };

  const removeUser = (userId: string) => {
    onUserSelectionChange(selectedUserIds.filter(id => id !== userId));
  };

  const getSelectedUsers = () => {
    return users.filter(user => selectedUserIds.includes(user.id));
  };

  const getUserDisplayName = (user: User) => {
    return user.full_name || user.email;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Task Assignments</Label>
        <div className="text-sm text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <Label>Task Assignments</Label>
      </div>

      {/* Selected Users Display */}
      {selectedUserIds.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Assigned Users:</div>
          <div className="flex flex-wrap gap-2">
            {getSelectedUsers().map(user => (
              <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                {getUserDisplayName(user)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUser(user.id)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* User Selection */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Available Users</CardTitle>
        </CardHeader>
        <CardContent className="max-h-60 overflow-y-auto space-y-2">
          {users.length === 0 ? (
            <div className="text-sm text-muted-foreground">No users available</div>
          ) : (
            users.map(user => (
              <div key={user.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`user-${user.id}`}
                  checked={selectedUserIds.includes(user.id)}
                  onCheckedChange={() => handleUserToggle(user.id)}
                />
                <label
                  htmlFor={`user-${user.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  {getUserDisplayName(user)}
                </label>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {selectedUserIds.length === 0 && (
        <div className="text-xs text-muted-foreground">
          No users assigned. Select users from the list above to assign them to this task.
        </div>
      )}
    </div>
  );
};

export default TaskAssignmentForm;
