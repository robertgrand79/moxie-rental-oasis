
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus, UserMinus, X } from 'lucide-react';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useEnhancedRolesPermissions } from '@/hooks/useEnhancedRolesPermissions';
import { toast } from '@/hooks/use-toast';

interface UserRoleAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: any;
}

const UserRoleAssignmentModal = ({ open, onOpenChange, role }: UserRoleAssignmentModalProps) => {
  const { users, loading: usersLoading, searchUsers } = useUserManagement();
  const { assignRoleToUser, removeRoleFromUser, getUserRoles } = useEnhancedRolesPermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoles, setUserRoles] = useState<Record<string, any[]>>({});
  const [assigningUsers, setAssigningUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && role) {
      // Fetch user roles for all users to see current assignments
      const fetchUserRoles = async () => {
        const roleData: Record<string, any[]> = {};
        for (const user of users) {
          const roles = await getUserRoles(user.id);
          roleData[user.id] = roles;
        }
        setUserRoles(roleData);
      };
      fetchUserRoles();
    }
  }, [open, role, users, getUserRoles]);

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasRole = (userId: string) => {
    return userRoles[userId]?.some(ur => ur.role?.id === role?.id) || false;
  };

  const handleAssignRole = async (userId: string) => {
    if (!role) return;
    
    setAssigningUsers(prev => new Set(prev).add(userId));
    try {
      const success = await assignRoleToUser(userId, role.id);
      if (success) {
        // Refresh user roles
        const roles = await getUserRoles(userId);
        setUserRoles(prev => ({ ...prev, [userId]: roles }));
        toast({
          title: 'Success',
          description: `Role "${role.name}" assigned successfully.`,
        });
      }
    } finally {
      setAssigningUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRemoveRole = async (userId: string) => {
    if (!role) return;
    
    setAssigningUsers(prev => new Set(prev).add(userId));
    try {
      const success = await removeRoleFromUser(userId, role.id);
      if (success) {
        // Refresh user roles
        const roles = await getUserRoles(userId);
        setUserRoles(prev => ({ ...prev, [userId]: roles }));
        toast({
          title: 'Success',
          description: `Role "${role.name}" removed successfully.`,
        });
      }
    } finally {
      setAssigningUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Role: {role.name}</DialogTitle>
          <DialogDescription>
            Manage which users have this role assigned
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {usersLoading ? (
              <div className="text-center py-8">
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {hasRole(user.id) ? (
                          <>
                            <Badge variant="default">Has Role</Badge>
                            <EnhancedButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveRole(user.id)}
                              loading={assigningUsers.has(user.id)}
                              icon={<UserMinus className="h-4 w-4" />}
                            >
                              Remove
                            </EnhancedButton>
                          </>
                        ) : (
                          <EnhancedButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignRole(user.id)}
                            loading={assigningUsers.has(user.id)}
                            icon={<UserPlus className="h-4 w-4" />}
                          >
                            Assign
                          </EnhancedButton>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="pt-4 border-t">
            <EnhancedButton
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full"
              icon={<X className="h-4 w-4" />}
            >
              Close
            </EnhancedButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserRoleAssignmentModal;
