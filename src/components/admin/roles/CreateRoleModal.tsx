
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Save } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Define a new role and assign permissions to it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label>Permissions</Label>
            <div className="mt-2 space-y-3">
              {permissions.filter(p => p.enabled).map((permission) => (
                <div key={permission.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={permission.id}
                    checked={formData.permissions.includes(permission.id)}
                    onCheckedChange={(checked) => 
                      handlePermissionChange(permission.id, checked as boolean)
                    }
                  />
                  <div className="space-y-1">
                    <Label htmlFor={permission.id} className="text-sm font-medium">
                      {permission.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
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
