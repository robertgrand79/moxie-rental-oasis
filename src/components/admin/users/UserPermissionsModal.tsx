
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfile, UserPermissions, permissionCategories, permissionLabels } from '@/hooks/useUserPermissions';

interface UserPermissionsModalProps {
  user: UserProfile | null;
  open: boolean;
  onClose: () => void;
  onUpdatePermissions: (userId: string, permissions: Partial<UserPermissions>) => Promise<boolean>;
}

const UserPermissionsModal = ({ user, open, onClose, onUpdatePermissions }: UserPermissionsModalProps) => {
  const [permissions, setPermissions] = useState<UserPermissions>(user?.permissions || {} as UserPermissions);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (user) {
      setPermissions(user.permissions);
    }
  }, [user]);

  const handlePermissionChange = (key: keyof UserPermissions, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    const success = await onUpdatePermissions(user.id, permissions);
    setSaving(false);
    
    if (success) {
      onClose();
    }
  };

  const getEnabledPermissionsCount = (categoryKeys: string[]) => {
    return categoryKeys.filter(key => permissions[key as keyof UserPermissions]).length;
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div>
              <div className="text-xl font-semibold">{user.full_name || user.email}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {user.email}
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {user.role === 'admin' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-4">
                <p className="text-sm text-orange-800">
                  This user has admin role and automatically has access to all features. 
                  Individual permissions are not enforced for admin users.
                </p>
              </CardContent>
            </Card>
          )}

          {Object.entries(permissionCategories).map(([category, categoryKeys]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {category}
                  <Badge variant="outline">
                    {getEnabledPermissionsCount(categoryKeys)} / {categoryKeys.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryKeys.map(key => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key} className="text-sm font-medium">
                      {permissionLabels[key as keyof UserPermissions]}
                    </Label>
                    <Switch
                      id={key}
                      checked={permissions[key as keyof UserPermissions]}
                      onCheckedChange={(checked) => 
                        handlePermissionChange(key as keyof UserPermissions, checked)
                      }
                      disabled={user.role === 'admin'}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserPermissionsModal;
