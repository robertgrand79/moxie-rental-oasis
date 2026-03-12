
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
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

  const groupedPermissions = React.useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    
    permissions.filter(p => p.enabled).forEach(permission => {
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md md:w-[500px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-lg font-semibold tracking-tight">Create New Role</SheetTitle>
          <SheetDescription>
            Define a new role and assign permissions to it.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
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

            <div>
              <Label className="mb-3 block">
                Permissions ({formData.permissions.length} selected)
              </Label>
              <ScrollArea className="max-h-96 pr-4">
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
          </div>

          <div className="border-t border-border/40 p-6 flex gap-3 mt-auto">
            <EnhancedButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              icon={<X className="h-4 w-4" strokeWidth={1.5} />}
            >
              Cancel
            </EnhancedButton>
            <EnhancedButton
              type="submit"
              variant="gradient"
              loading={loading}
              disabled={!formData.name.trim()}
              className="flex-1"
              icon={<Save className="h-4 w-4" strokeWidth={1.5} />}
            >
              Create Role
            </EnhancedButton>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateRoleModal;
