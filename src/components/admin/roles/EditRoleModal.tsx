
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Save, Trash2 } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface EditRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  permissions: Permission[];
  onUpdateRole: (roleId: string, updates: Partial<Role>) => Promise<boolean>;
  onDeleteRole: (roleId: string) => Promise<boolean>;
  loading: boolean;
}

const EditRoleModal = ({ 
  open, 
  onOpenChange, 
  role, 
  permissions, 
  onUpdateRole, 
  onDeleteRole, 
  loading 
}: EditRoleModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: [...role.permissions]
      });
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role || !formData.name.trim()) {
      return;
    }

    const success = await onUpdateRole(role.id, formData);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleDelete = async () => {
    if (!role) return;
    
    if (window.confirm(`Are you sure you want to delete the "${role.name}" role? This action cannot be undone.`)) {
      const success = await onDeleteRole(role.id);
      if (success) {
        onOpenChange(false);
      }
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

  if (!role) return null;

  const canDelete = role.userCount === 0 && role.name !== 'Admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role: {role.name}</DialogTitle>
          <DialogDescription>
            Modify role details and permissions.
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
              disabled={role.name === 'Admin'}
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
                    disabled={role.name === 'Admin'}
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
            
            {canDelete && (
              <EnhancedButton
                type="button"
                variant="destructive"
                onClick={handleDelete}
                loading={loading}
                icon={<Trash2 className="h-4 w-4" />}
              >
                Delete
              </EnhancedButton>
            )}
            
            <EnhancedButton
              type="submit"
              variant="gradient"
              loading={loading}
              disabled={!formData.name.trim()}
              className="flex-1"
              icon={<Save className="h-4 w-4" />}
            >
              Update
            </EnhancedButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleModal;
