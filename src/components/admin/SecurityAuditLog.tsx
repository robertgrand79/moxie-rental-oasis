
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

const SecurityAuditLog = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <p>Access denied. Admin privileges required.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security Audit Log
        </CardTitle>
        <CardDescription>
          Security audit logging is currently using console output
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">Audit logs are currently in console mode</p>
          <p className="text-sm">Check the browser console for security event logs.</p>
          <p className="text-xs mt-2 text-gray-400">Database audit logging will be enabled once types are updated.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;
