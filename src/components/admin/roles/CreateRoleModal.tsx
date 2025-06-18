
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Save } from 'lucide-react';
import PermissionGroup from './PermissionGroup';

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface CreateRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissions: Permission[];
  onCreateRole: (roleData: { name: string; description: string; permissions: string[] }) => Promise<boolean>;
  loading: boolean;
}

const CreateRoleModal = ({ open, onOpenChange, permissions, onCreateRole, loading }: CreateRoleModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  // Group permissions by category (extract from permission key)
  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    
    permissions.filter(p => p.enabled).forEach(permission => {
      // Extract category from permission key (e.g., 'users.create' -> 'Users')
      const category = permission.id.split('.')[0];
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(permission);
    });
    
    return groups;
  }, [permissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    const success = await onCreateRole(formData);
    if (success) {
      setFormData({ name: '', description: '', permissions: [] });
      onOpenChange(false);
    }
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(id => id !== permissionId)
    }));
  };

  const handleSelectAllInCategory = (permissionIds: string[], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...new Set([...prev.permissions, ...permissionIds])]
        : prev.permissions.filter(id => !permissionIds.includes(id))
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Define a new role and assign permissions to it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-4">
          <div>
            <Label htmlFor="roleName">Role Name *</Label>
            <Input
              id="roleName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter role name"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="roleDescription">Description</Label>
            <Textarea
              id="roleDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this role's purpose"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex-1 flex flex-col">
            <Label className="mb-3">
              Permissions ({formData.permissions.length} selected)
            </Label>
            <ScrollArea className="flex-1 max-h-96 pr-4">
              <div className="space-y-3">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <PermissionGroup
                    key={category}
                    category={category}
                    permissions={categoryPermissions}
                    selectedPermissions={formData.permissions}
                    onPermissionChange={handlePermissionChange}
                    onSelectAll={handleSelectAllInCategory}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <EnhancedButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              icon={<X className="h-4 w-4" />}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton
              type="submit"
              variant="gradient"
              loading={loading}
              disabled={!formData.name.trim()}
              className="flex-1"
              icon={<Save className="h-4 w-4" />}
            >
              Create Role
            </EnhancedButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoleModal;
