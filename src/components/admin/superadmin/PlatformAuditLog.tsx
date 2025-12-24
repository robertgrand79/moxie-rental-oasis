import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  Search, 
  User, 
  Building2, 
  Eye, 
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const ACTION_TYPES = [
  { value: 'all', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'impersonation_start', label: 'Impersonation Start' },
  { value: 'impersonation_end', label: 'Impersonation End' },
  { value: 'org_update', label: 'Organization Update' },
  { value: 'user_update', label: 'User Update' },
  { value: 'subscription_change', label: 'Subscription Change' },
  { value: 'account_suspend', label: 'Account Suspend' },
  { value: 'account_delete', label: 'Account Delete' },
];

const PlatformAuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['platform-audit-logs', actionFilter],
    queryFn: async () => {
      let query = supabase
        .from('platform_admin_audit_logs')
        .select(`
          *,
          admin:admin_user_id (
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.eq('action_type', actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'login':
        return <User className="h-4 w-4" />;
      case 'impersonation_start':
      case 'impersonation_end':
        return <Eye className="h-4 w-4" />;
      case 'org_update':
      case 'account_suspend':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getActionBadgeVariant = (actionType: string) => {
    if (actionType.includes('delete') || actionType.includes('suspend')) return 'destructive';
    if (actionType.includes('impersonation')) return 'secondary';
    return 'outline';
  };

  const filteredLogs = logs.filter((log: any) => 
    log.target_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.admin as any)?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Admin Email', 'Action', 'Target Type', 'Target Name', 'IP Address'].join(','),
      ...filteredLogs.map((log: any) => [
        log.created_at,
        (log.admin as any)?.email || 'Unknown',
        log.action_type,
        log.target_type || '',
        log.target_name || '',
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Platform Admin Audit Log
            </CardTitle>
            <CardDescription>
              Track all administrative actions taken on the platform
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by admin, target, or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                  <div className="mt-1 p-2 rounded-full bg-muted">
                    {getActionIcon(log.action_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getActionBadgeVariant(log.action_type)}>
                        {log.action_type?.replace(/_/g, ' ')}
                      </Badge>
                      {log.target_type && (
                        <span className="text-xs text-muted-foreground">
                          on {log.target_type}
                        </span>
                      )}
                      {log.target_name && (
                        <span className="font-medium text-sm">{log.target_name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>by {(log.admin as any)?.email || 'Unknown admin'}</span>
                      <span>•</span>
                      <span>{format(new Date(log.created_at), 'MMM d, yyyy h:mm:ss a')}</span>
                      {log.ip_address && (
                        <>
                          <span>•</span>
                          <span>IP: {log.ip_address}</span>
                        </>
                      )}
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PlatformAuditLog;
