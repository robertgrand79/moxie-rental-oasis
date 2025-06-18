
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PermissionGroupProps {
  category: string;
  permissions: Permission[];
  selectedPermissions: string[];
  onPermissionChange: (permissionId: string, checked: boolean) => void;
  onSelectAll: (permissionIds: string[], checked: boolean) => void;
}

const PermissionGroup = React.memo(({ 
  category, 
  permissions, 
  selectedPermissions, 
  onPermissionChange,
  onSelectAll 
}: PermissionGroupProps) => {
  const [isOpen, setIsOpen] = React.useState(true);
  
  const permissionIds = permissions.map(p => p.id);
  const selectedCount = permissionIds.filter(id => selectedPermissions.includes(id)).length;
  const allSelected = selectedCount === permissions.length;
  const someSelected = selectedCount > 0 && selectedCount < permissions.length;

  const handleSelectAll = () => {
    onSelectAll(permissionIds, !allSelected);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center space-x-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <h4 className="font-medium text-sm">
                {category} ({selectedCount}/{permissions.length})
              </h4>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAll();
              }}
              className="text-xs"
            >
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-3 max-h-48 overflow-y-auto">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-start space-x-3">
                <Checkbox
                  id={permission.id}
                  checked={selectedPermissions.includes(permission.id)}
                  onCheckedChange={(checked) => 
                    onPermissionChange(permission.id, checked as boolean)
                  }
                />
                <div className="space-y-1 flex-1">
                  <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer">
                    {permission.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {permission.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});

PermissionGroup.displayName = 'PermissionGroup';

export default PermissionGroup;
