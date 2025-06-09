
import React, { useState } from 'react';
import { MoreHorizontal, Shield, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserProfile, UserPermissions } from '@/hooks/useUserPermissions';

interface UserPermissionsTableProps {
  users: UserProfile[];
  onEditPermissions: (user: UserProfile) => void;
  onUpdateRole: (userId: string, role: string) => Promise<boolean>;
  onQuickPermissionToggle: (userId: string, permission: keyof UserPermissions, value: boolean) => Promise<boolean>;
}

const UserPermissionsTable = ({ 
  users, 
  onEditPermissions, 
  onUpdateRole,
  onQuickPermissionToggle 
}: UserPermissionsTableProps) => {
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingRole(userId);
    await onUpdateRole(userId, newRole);
    setUpdatingRole(null);
  };

  const getPermissionCount = (permissions: UserPermissions) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const getQuickPermissions = (user: UserProfile) => {
    const key1: keyof UserPermissions = 'manage_site_settings';
    const key2: keyof UserPermissions = 'manage_users';
    const key3: keyof UserPermissions = 'manage_properties';
    
    return [
      { key: key1, label: 'Settings', value: user.permissions[key1] },
      { key: key2, label: 'Users', value: user.permissions[key2] },
      { key: key3, label: 'Properties', value: user.permissions[key3] },
    ];
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Quick Permissions</TableHead>
          <TableHead>Total Permissions</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div>
                <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
            </TableCell>
            
            <TableCell>
              <Select
                value={user.role}
                onValueChange={(value) => handleRoleChange(user.id, value)}
                disabled={updatingRole === user.id}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            
            <TableCell>
              <div className="flex gap-1">
                {getQuickPermissions(user).map(({ key, label, value }) => (
                  <Button
                    key={key}
                    variant={value ? "default" : "outline"}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => onQuickPermissionToggle(user.id, key, !value)}
                    disabled={user.role === 'admin'}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </TableCell>
            
            <TableCell>
              <Badge variant="outline">
                {user.role === 'admin' ? 'All' : `${getPermissionCount(user.permissions)}/18`}
              </Badge>
            </TableCell>
            
            <TableCell>
              <div className="text-sm text-muted-foreground">
                {new Date(user.updated_at).toLocaleDateString()}
              </div>
            </TableCell>
            
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditPermissions(user)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Permissions
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserPermissionsTable;
