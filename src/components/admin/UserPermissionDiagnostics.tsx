import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle, RefreshCw, User, Shield, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { supabase } from '@/integrations/supabase/client';

interface UserDiagnosticsProps {
  userId?: string;
  email?: string;
}

const UserPermissionDiagnostics: React.FC<UserDiagnosticsProps> = ({ userId, email }) => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { permissions, hasPermission } = usePermissions();
  const { userRole, isAdmin } = useRoleSystem();

  const targetUserId = userId || user?.id;
  const targetEmail = email || user?.email;

  const runDiagnostics = async () => {
    if (!targetUserId) return;
    
    setLoading(true);
    
    try {
      // Check legacy role system
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status, last_login_at, created_at')
        .eq('id', targetUserId)
        .single();

      // Check new role system
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select(`
          role:role_id(name, description),
          is_active,
          expires_at
        `)
        .eq('user_id', targetUserId);

      // Check admin function
      const { data: isAdminCheck } = await supabase
        .rpc('is_admin');

      // Test property access
      let propertyAccessTest = null;
      try {
        const { data: properties, error: propError } = await supabase
          .from('properties')
          .select('id')
          .limit(1);
        propertyAccessTest = { success: !propError, error: propError?.message };
      } catch (error) {
        propertyAccessTest = { success: false, error: (error as Error).message };
      }

      setDiagnostics({
        targetUser: {
          id: targetUserId,
          email: targetEmail
        },
        legacySystem: {
          profile,
          hasAccess: !!profile,
        },
        newRoleSystem: {
          userRoles,
          hasRoles: userRoles && userRoles.length > 0
        },
        adminCheck: {
          result: isAdminCheck,
          canAccessAdminFunctions: hasPermission('admin.access_panel')
        },
        propertyAccess: propertyAccessTest,
        currentPermissions: permissions,
        sessionInfo: {
          isAuthenticated: !!user,
          sessionActive: !!user?.id,
          role: userRole?.name,
          isAdmin: isAdmin()
        }
      });
    } catch (error) {
      console.error('Diagnostics error:', error);
      setDiagnostics({
        error: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const getDiagnosticIcon = (status: boolean | undefined) => {
    if (status === true) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (status === false) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Permission Diagnostics
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Run Diagnostics
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!diagnostics && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Diagnostics" to check user permissions and access
          </div>
        )}

        {diagnostics?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <strong>Diagnostics Failed</strong>
            </div>
            <p className="text-red-700 mt-1">{diagnostics.error}</p>
          </div>
        )}

        {diagnostics && !diagnostics.error && (
          <div className="space-y-4">
            {/* Target User Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Target User</h3>
              <p><strong>ID:</strong> {diagnostics.targetUser.id}</p>
              <p><strong>Email:</strong> {diagnostics.targetUser.email}</p>
            </div>

            {/* Legacy System Check */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Legacy Role System
                    {getDiagnosticIcon(diagnostics.legacySystem.hasAccess)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex justify-between">
                    <span>Profile Found:</span>
                    <Badge variant={diagnostics.legacySystem.hasAccess ? 'default' : 'destructive'}>
                      {diagnostics.legacySystem.hasAccess ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {diagnostics.legacySystem.profile && (
                    <>
                      <div className="flex justify-between">
                        <span>Role:</span>
                        <Badge>{diagnostics.legacySystem.profile.role}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={diagnostics.legacySystem.profile.status === 'active' ? 'default' : 'secondary'}>
                          {diagnostics.legacySystem.profile.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Login:</span>
                        <span className="text-sm">
                          {diagnostics.legacySystem.profile.last_login_at 
                            ? new Date(diagnostics.legacySystem.profile.last_login_at).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    New Role System
                    {getDiagnosticIcon(diagnostics.newRoleSystem.hasRoles)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex justify-between">
                    <span>Roles Found:</span>
                    <Badge variant={diagnostics.newRoleSystem.hasRoles ? 'default' : 'secondary'}>
                      {diagnostics.newRoleSystem.userRoles?.length || 0}
                    </Badge>
                  </div>
                  {diagnostics.newRoleSystem.userRoles?.map((ur: any, idx: number) => (
                    <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                      <div><strong>Role:</strong> {ur.role?.name}</div>
                      <div><strong>Active:</strong> {ur.is_active ? 'Yes' : 'No'}</div>
                      {ur.expires_at && <div><strong>Expires:</strong> {new Date(ur.expires_at).toLocaleDateString()}</div>}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Access Tests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Access Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Admin Function Check:</span>
                  <div className="flex items-center gap-2">
                    {getDiagnosticIcon(diagnostics.adminCheck.result)}
                    <Badge variant={diagnostics.adminCheck.result ? 'default' : 'secondary'}>
                      {diagnostics.adminCheck.result ? 'Admin' : 'Not Admin'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Admin Panel Access:</span>
                  <div className="flex items-center gap-2">
                    {getDiagnosticIcon(diagnostics.adminCheck.canAccessAdminFunctions)}
                    <Badge variant={diagnostics.adminCheck.canAccessAdminFunctions ? 'default' : 'secondary'}>
                      {diagnostics.adminCheck.canAccessAdminFunctions ? 'Allowed' : 'Denied'}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span>Property Data Access:</span>
                  <div className="flex items-center gap-2">
                    {getDiagnosticIcon(diagnostics.propertyAccess?.success)}
                    <Badge variant={diagnostics.propertyAccess?.success ? 'default' : 'destructive'}>
                      {diagnostics.propertyAccess?.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
                {diagnostics.propertyAccess?.error && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    Error: {diagnostics.propertyAccess.error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Session Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Session Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Authenticated:</span>
                  <Badge variant={diagnostics.sessionInfo.isAuthenticated ? 'default' : 'destructive'}>
                    {diagnostics.sessionInfo.isAuthenticated ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Current Role:</span>
                  <Badge>{diagnostics.sessionInfo.role || 'None'}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Is Admin:</span>
                  <Badge variant={diagnostics.sessionInfo.isAdmin ? 'default' : 'secondary'}>
                    {diagnostics.sessionInfo.isAdmin ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Current Permissions */}
            {Object.keys(diagnostics.currentPermissions).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Current Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(diagnostics.currentPermissions).map(([key, value]) => (
                      <Badge key={key} variant={value ? 'default' : 'outline'} className="text-xs">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPermissionDiagnostics;