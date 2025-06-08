
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { Shield, Search, AlertTriangle, CheckCircle } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  details: any;
  created_at: string;
}

const SecurityAuditLog = () => {
  const [auditLogs] = useState<AuditLogEntry[]>([]);
  const [loading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeVariant = (action: string, success: boolean) => {
    if (!success) return 'destructive';
    if (action.includes('login') || action.includes('admin')) return 'default';
    return 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security Audit Log
        </CardTitle>
        <CardDescription>
          Monitor security events and administrative actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading audit logs...</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {auditLogs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="font-medium">Security Audit Log Setup Required</p>
                <p className="text-sm">The security audit log table needs to be created in the database.</p>
                <p className="text-sm mt-2">Once the database types are updated, audit logging will be available.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityAuditLog;
