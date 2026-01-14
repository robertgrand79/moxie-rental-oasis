import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Search, Eye, RefreshCw, Bug } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ErrorLog {
  id: string;
  error_id: string;
  message: string;
  type: string;
  severity: string;
  stack: string | null;
  url: string | null;
  user_agent: string | null;
  fingerprint: string;
  context: Record<string, unknown> | null;
  breadcrumbs: Array<Record<string, unknown>> | null;
  tags: string[] | null;
  resolved: boolean;
  created_at: string;
}

interface ErrorLogsTableProps {
  showAllTenants?: boolean;
}

const ErrorLogsTable: React.FC<ErrorLogsTableProps> = ({ showAllTenants = false }) => {
  const { organization } = useCurrentOrganization();
  const organizationId = organization?.id;
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  const { data: errors, isLoading, refetch } = useQuery({
    queryKey: ['error-logs', organizationId, showAllTenants, severityFilter],
    queryFn: async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ErrorLog[];
    },
    enabled: showAllTenants || !!organizationId,
  });

  const resolveMutation = useMutation({
    mutationFn: async (errorId: string) => {
      const { error } = await supabase
        .from('error_logs')
        .update({ resolved: true })
        .eq('id', errorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['error-logs'] });
      toast.success('Error marked as resolved');
    },
    onError: () => {
      toast.error('Failed to update error status');
    },
  });

  const filteredErrors = errors?.filter(error => {
    const query = searchTerm.toLowerCase();
    return (error.message?.toLowerCase() || '').includes(query) ||
      (error.type?.toLowerCase() || '').includes(query);
  }) || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'fatal': return 'bg-destructive text-destructive-foreground';
      case 'error': return 'bg-destructive/80 text-destructive-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'info': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const unresolvedCount = errors?.filter(e => !e.resolved).length || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Error Logs
                {unresolvedCount > 0 && (
                  <Badge variant="destructive">{unresolvedCount} unresolved</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Track and resolve application errors
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search errors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="fatal">Fatal</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading errors...</div>
          ) : filteredErrors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              No errors found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredErrors.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell>
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {error.message}
                      </TableCell>
                      <TableCell>{error.type}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(error.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell>
                        {error.resolved ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedError(error)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!error.resolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resolveMutation.mutate(error.id)}
                              disabled={resolveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error Details
            </DialogTitle>
            <DialogDescription>
              Error ID: {selectedError?.error_id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedError && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Message</h4>
                <p className="text-sm bg-muted p-3 rounded-md">{selectedError.message}</p>
              </div>
              
              {selectedError.stack && (
                <div>
                  <h4 className="font-medium mb-1">Stack Trace</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                    {selectedError.stack}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Type</h4>
                  <p className="text-sm text-muted-foreground">{selectedError.type}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">URL</h4>
                  <p className="text-sm text-muted-foreground">{selectedError.url || 'N/A'}</p>
                </div>
              </div>

              {selectedError.context && (
                <div>
                  <h4 className="font-medium mb-1">Context</h4>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedError.context, null, 2)}
                  </pre>
                </div>
              )}

              {selectedError.breadcrumbs && selectedError.breadcrumbs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Breadcrumbs</h4>
                  <div className="space-y-1">
                    {selectedError.breadcrumbs.map((crumb, i) => (
                      <div key={i} className="text-xs bg-muted p-2 rounded">
                        {JSON.stringify(crumb)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ErrorLogsTable;
