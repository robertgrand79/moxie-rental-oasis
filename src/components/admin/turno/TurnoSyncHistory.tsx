import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface SyncLogEntry {
  id: string;
  work_order_id: string;
  sync_direction: string;
  sync_status: string;
  status_before?: string;
  status_after?: string;
  conflict_resolution?: string;
  error_message?: string;
  sync_details?: any;
  turno_api_response?: any;
  created_at: string;
}

export function TurnoSyncHistory() {
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSyncLogs();
  }, []);

  const fetchSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('turno_sync_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching sync logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Exception fetching sync logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : 
                   status === 'error' ? 'destructive' : 
                   status === 'pending' ? 'secondary' : 'outline';
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const getSyncTypeLabel = (syncType: string) => {
    switch (syncType) {
      case 'problems':
        return 'Problems Sync';
      case 'properties':
        return 'Properties Sync';
      case 'status_update':
        return 'Status Update';
      case 'full_sync':
        return 'Full Sync';
      default:
        return syncType;
    }
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return 'N/A';
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-3 w-48 mt-2" />
              <div className="flex gap-4 mt-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No sync history yet</p>
            <p className="text-sm">Sync logs will appear here after running synchronization operations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Work Order Sync - {log.sync_direction}
              </CardTitle>
              {getStatusBadge(log.sync_status)}
            </div>
            <CardDescription>
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
              {log.work_order_id && ` • Work Order: ${log.work_order_id.substring(0, 8)}...`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {log.sync_status === 'error' && log.error_message && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                <p className="text-sm text-red-600">{log.error_message}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {log.status_before && (
                <div>
                  <span className="text-muted-foreground">Status Before:</span>
                  <span className="ml-1 font-medium">{log.status_before}</span>
                </div>
              )}
              {log.status_after && (
                <div>
                  <span className="text-muted-foreground">Status After:</span>
                  <span className="ml-1 font-medium">{log.status_after}</span>
                </div>
              )}
            </div>

            {log.sync_details && Object.keys(log.sync_details).length > 0 && (
              <details className="mt-3">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  View Sync Details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(log.sync_details, null, 2)}
                </pre>
              </details>
            )}

            {log.turno_api_response && Object.keys(log.turno_api_response).length > 0 && (
              <details className="mt-3">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  View API Response
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(log.turno_api_response, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}