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
  ShieldAlert, 
  Search, 
  LogIn, 
  LogOut,
  AlertTriangle,
  Eye,
  UserX,
  Download,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface SecurityAuditLogEntry {
  id: string;
  created_at: string;
  event_type: string;
  user_id: string | null;
  user_agent: string | null;
  resource: string | null;
  action: string;
  details: Record<string, unknown>;
  risk_level: string;
}

const EVENT_TYPES = [
  { value: 'all', label: 'All Events' },
  { value: 'authentication', label: 'Authentication' },
  { value: 'authorization', label: 'Authorization' },
  { value: 'data_access', label: 'Data Access' },
  { value: 'admin_action', label: 'Admin Action' },
  { value: 'suspicious_activity', label: 'Suspicious Activity' },
];

const RISK_LEVELS = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const SecurityAuditLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['security-audit-logs', eventFilter, riskFilter],
    queryFn: async () => {
      let query = supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (eventFilter !== 'all') {
        query = query.eq('event_type', eventFilter);
      }

      if (riskFilter !== 'all') {
        query = query.eq('risk_level', riskFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []) as SecurityAuditLogEntry[];
    },
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'authentication':
        return <LogIn className="h-4 w-4" />;
      case 'authorization':
        return <UserX className="h-4 w-4" />;
      case 'data_access':
        return <Eye className="h-4 w-4" />;
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <ShieldAlert className="h-4 w-4" />;
    }
  };

  const getRiskBadgeVariant = (riskLevel: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (riskLevel) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRiskBadgeClass = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500 text-black';
      default:
        return '';
    }
  };

  const filteredLogs = logs.filter((log) => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details?.user_email as string)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Event Type', 'Action', 'Resource', 'Risk Level', 'User Email', 'User Agent'].join(','),
      ...filteredLogs.map((log) => [
        log.created_at,
        log.event_type,
        log.action,
        log.resource || '',
        log.risk_level,
        (log.details?.user_email as string) || '',
        log.user_agent || ''
      ].map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Security Audit Log
            </CardTitle>
            <CardDescription>
              Track authentication, authorization, and security events
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
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action, resource, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Risk level" />
            </SelectTrigger>
            <SelectContent>
              {RISK_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">
            Total: <strong>{filteredLogs.length}</strong>
          </span>
          <span className="text-red-500">
            High/Critical: <strong>{filteredLogs.filter(l => l.risk_level === 'high' || l.risk_level === 'critical').length}</strong>
          </span>
          <span className="text-yellow-600">
            Medium: <strong>{filteredLogs.filter(l => l.risk_level === 'medium').length}</strong>
          </span>
        </div>

        {/* Logs List */}
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading security logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No security audit logs found. Events will appear here as they occur.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                  <div className={`mt-1 p-2 rounded-full ${
                    log.risk_level === 'high' || log.risk_level === 'critical' 
                      ? 'bg-red-100 text-red-600' 
                      : log.risk_level === 'medium'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-muted'
                  }`}>
                    {getEventIcon(log.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">
                        {log.event_type?.replace(/_/g, ' ')}
                      </Badge>
                      <Badge 
                        variant={getRiskBadgeVariant(log.risk_level)}
                        className={getRiskBadgeClass(log.risk_level)}
                      >
                        {log.risk_level}
                      </Badge>
                      <span className="font-medium text-sm">{log.action?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                      {log.resource && (
                        <>
                          <span>Resource: {log.resource}</span>
                          <span>•</span>
                        </>
                      )}
                      {log.details?.user_email && (
                        <>
                          <span>User: {log.details.user_email as string}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{format(new Date(log.created_at), 'MMM d, yyyy h:mm:ss a')}</span>
                    </div>
                    {log.details && Object.keys(log.details).length > 2 && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto max-h-24">
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

export default SecurityAuditLog;
