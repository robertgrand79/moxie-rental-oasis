
import React, { useState } from 'react';
import { Plus, Shield, Users, Lock } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminRolesPermissions = () => {
  const [roles] = useState([
    {
      id: 1,
      name: 'Admin',
      description: 'Full system access',
      userCount: 1,
      permissions: ['read', 'write', 'delete', 'manage_users']
    },
    {
      id: 2,
      name: 'Editor',
      description: 'Can edit content',
      userCount: 2,
      permissions: ['read', 'write']
    },
    {
      id: 3,
      name: 'User',
      description: 'Basic user access',
      userCount: 5,
      permissions: ['read']
    }
  ]);

  const [permissions] = useState([
    { id: 'read', name: 'Read', description: 'View content and data' },
    { id: 'write', name: 'Write', description: 'Create and edit content' },
    { id: 'delete', name: 'Delete', description: 'Remove content and data' },
    { id: 'manage_users', name: 'Manage Users', description: 'Add, edit, and remove users' },
    { id: 'manage_settings', name: 'Manage Settings', description: 'Configure system settings' }
  ]);

  const handleCreateRole = () => {
    console.log('Create role functionality would go here');
  };

  const pageActions = (
    <EnhancedButton 
      onClick={handleCreateRole} 
      variant="gradient"
      icon={<Plus className="h-4 w-4" />}
    >
      Create Role
    </EnhancedButton>
  );

  return (
    <AdminPageWrapper
      title="Roles & Permissions"
      description="Manage user roles and system permissions"
      actions={pageActions}
    >
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.length}</div>
              <p className="text-xs text-muted-foreground">
                System roles configured
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Permissions</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{permissions.length}</div>
              <p className="text-xs text-muted-foreground">
                Available permissions
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users Assigned</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {roles.reduce((sum, role) => sum + role.userCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total role assignments
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>
                Manage user roles and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Permissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{role.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{role.userCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permission Settings</CardTitle>
              <CardDescription>
                Configure system-wide permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">{permission.name}</Label>
                    <div className="text-sm text-muted-foreground">
                      {permission.description}
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminRolesPermissions;
