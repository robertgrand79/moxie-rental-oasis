import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertTriangle, Clock, CheckCircle, XCircle, MoreHorizontal, ExternalLink, Link, Unlink } from 'lucide-react';
import type { TurnoProblem } from '@/types/turnoProblems';
import { formatDistanceToNow } from 'date-fns';

interface TurnoProblemsTableProps {
  problems: TurnoProblem[];
  loading: boolean;
  onCreateWorkOrder?: (problemId: string) => void;
  onLinkWorkOrder?: (problemId: string) => void;
  onUnlinkWorkOrder?: (problemId: string) => void;
  onDeleteProblems?: (problemIds: string[]) => Promise<void>;
  onBulkCreateWorkOrders?: (problemIds: string[]) => Promise<void>;
  onBulkStatusUpdate?: (problemIds: string[], status: string) => Promise<void>;
  onBulkExport?: (problemIds: string[]) => void;
}

const TurnoProblemsTable = ({ problems, loading }: TurnoProblemsTableProps) => {
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    if (selectedProblems.size === problems.length) {
      setSelectedProblems(new Set());
    } else {
      setSelectedProblems(new Set(problems.map(p => p.id)));
    }
  };

  const handleSelectProblem = (problemId: string) => {
    const newSelected = new Set(selectedProblems);
    if (newSelected.has(problemId)) {
      newSelected.delete(problemId);
    } else {
      newSelected.add(problemId);
    }
    setSelectedProblems(newSelected);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive' as const;
      case 'in_progress':
        return 'default' as const;
      case 'resolved':
        return 'secondary' as const;
      case 'closed':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive' as const;
      case 'high':
        return 'default' as const;
      case 'medium':
        return 'secondary' as const;
      case 'low':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getSyncStatusVariant = (syncStatus: string) => {
    switch (syncStatus) {
      case 'synced':
        return 'secondary' as const;
      case 'pending':
        return 'default' as const;
      case 'conflict':
        return 'destructive' as const;
      case 'error':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Problems</CardTitle>
          <CardDescription>Loading problems...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (problems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Problems</CardTitle>
          <CardDescription>No problems found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No Turno problems to display.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try syncing from Turno or adjusting your filters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Problems</CardTitle>
            <CardDescription>
              {problems.length} problem{problems.length !== 1 ? 's' : ''} from Turno
            </CardDescription>
          </div>
          {selectedProblems.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedProblems.size} selected
              </Badge>
              <Button variant="outline" size="sm">
                Bulk Actions
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProblems.size === problems.length && problems.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Problem</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Sync Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {problems.map((problem) => (
                <TableRow key={problem.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProblems.has(problem.id)}
                      onCheckedChange={() => handleSelectProblem(problem.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{problem.title}</p>
                      {problem.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {problem.description}
                        </p>
                      )}
                      {problem.room_location && (
                        <Badge variant="outline" className="text-xs">
                          {problem.room_location}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{problem.property_address || 'Unknown Property'}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {problem.turno_property_id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(problem.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(problem.status)}
                      {problem.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(problem.priority)}>
                      {problem.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {problem.linked_work_order ? (
                      <div className="flex items-center gap-1">
                        <Link className="h-3 w-3 text-green-600" />
                        <span className="text-sm text-green-600">
                          {problem.linked_work_order.work_order_number}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Unlink className="h-3 w-3" />
                        <span className="text-sm">None</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSyncStatusVariant(problem.sync_status)}>
                      {problem.sync_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {problem.turno_updated_at 
                        ? formatDistanceToNow(new Date(problem.turno_updated_at)) + ' ago'
                        : 'Unknown'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {!problem.linked_work_order ? (
                          <DropdownMenuItem>
                            <Link className="h-4 w-4 mr-2" />
                            Create Work Order
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Unlink className="h-4 w-4 mr-2" />
                            Unlink Work Order
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TurnoProblemsTable;