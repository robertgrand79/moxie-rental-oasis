
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, X } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface UserRoleManagerProps {
  userId: string;
  currentRoles: Role[];
  availableRoles: Role[];
  onAssignRole: (userId: string, roleId: string) => Promise<boolean>;
  onRemoveRole: (userId: string, roleId: string) => Promise<boolean>;
  disabled?: boolean;
}

const UserRoleManager = ({
  userId,
  currentRoles,
  availableRoles,
  onAssignRole,
  onRemoveRole,
  disabled = false
}: UserRoleManagerProps) => {
  const [isAssigning, setIsAssigning] = useState(false);

  const availableToAssign = availableRoles.filter(
    role => !currentRoles.find(currentRole => currentRole.id === role.id)
  );

  const handleAssignRole = async (roleId: string) => {
    setIsAssigning(true);
    await onAssignRole(userId, roleId);
    setIsAssigning(false);
  };

  const handleRemoveRole = async (roleId: string) => {
    await onRemoveRole(userId, roleId);
  };

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'Super Admin':
        return 'destructive';
      case 'Admin':
        return 'default';
      case 'Editor':
        return 'secondary';
      case 'User':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {currentRoles.map((role) => (
        <Badge 
          key={role.id} 
          variant={getRoleBadgeVariant(role.name)}
          className="flex items-center gap-1"
        >
          {role.name}
          {!disabled && currentRoles.length > 1 && (
            <button
              onClick={() => handleRemoveRole(role.id)}
              className="ml-1 hover:bg-white/20 rounded-sm p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      
      {!disabled && availableToAssign.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isAssigning}
              className="h-6 px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Role
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {availableToAssign.map((role) => (
              <DropdownMenuItem
                key={role.id}
                onClick={() => handleAssignRole(role.id)}
              >
                <div>
                  <div className="font-medium">{role.name}</div>
                  {role.description && (
                    <div className="text-xs text-muted-foreground">
                      {role.description}
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default UserRoleManager;
