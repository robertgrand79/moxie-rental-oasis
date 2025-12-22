import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Bug, 
  Search, 
  Flame, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  Building2,
  User,
} from 'lucide-react';
import { useBugReports, BugReport, BugSeverity, BugStatus } from '@/hooks/useBugReports';
import { format, formatDistanceToNow } from 'date-fns';
import BugReportDetailDialog from './BugReportDetailDialog';

const severityConfig: Record<BugSeverity, { icon: React.ReactNode; color: string; bgColor: string }> = {
  critical: { icon: <Flame className="h-3 w-3" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  high: { icon: <AlertTriangle className="h-3 w-3" />, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  medium: { icon: <AlertCircle className="h-3 w-3" />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  low: { icon: <Info className="h-3 w-3" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
};

const statusConfig: Record<BugStatus, { icon: React.ReactNode; color: string; label: string }> = {
  open: { icon: <AlertCircle className="h-3 w-3" />, color: 'text-red-600', label: 'Open' },
  in_progress: { icon: <Clock className="h-3 w-3" />, color: 'text-yellow-600', label: 'In Progress' },
  resolved: { icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-600', label: 'Resolved' },
  closed: { icon: <XCircle className="h-3 w-3" />, color: 'text-gray-600', label: 'Closed' },
  wont_fix: { icon: <XCircle className="h-3 w-3" />, color: 'text-gray-500', label: "Won't Fix" },
};

const BugReportsTab: React.FC = () => {
  const { allBugReports, loadingAllReports, bugStats, deleteBugReport } = useBugReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BugStatus | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<BugSeverity | 'all'>('all');
  const [selectedBug, setSelectedBug] = useState<BugReport | null>(null);

  const filteredReports = allBugReports?.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.organization?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  }) || [];

  const StatCard = ({ title, value, icon: Icon, color }: { 
    title: string; 
    value: number; 
    icon: React.ElementType;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="Total Reports" value={bugStats?.total || 0} icon={Bug} color="text-muted-foreground" />
        <StatCard title="Open" value={bugStats?.open || 0} icon={AlertCircle} color="text-red-500" />
        <StatCard title="Critical" value={bugStats?.critical || 0} icon={Flame} color="text-red-600" />
        <StatCard title="In Progress" value={bugStats?.inProgress || 0} icon={Clock} color="text-yellow-500" />
        <StatCard title="Resolved" value={bugStats?.resolved || 0} icon={CheckCircle} color="text-green-500" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Bug Reports
          </CardTitle>
          <CardDescription>Review and manage bug reports from all organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BugStatus | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="wont_fix">Won't Fix</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as BugSeverity | 'all')}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="h-10 px-4 flex items-center">
              {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Table */}
          {loadingAllReports ? (
            <div className="text-center py-8">Loading bug reports...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all' 
                ? 'No reports match your filters' 
                : 'No bug reports yet'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => {
                    const severityStyle = severityConfig[report.severity];
                    const statusStyle = statusConfig[report.status];
                    
                    return (
                      <TableRow 
                        key={report.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedBug(report)}
                      >
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${severityStyle.bgColor} ${severityStyle.color} border-0`}
                          >
                            <span className="flex items-center gap-1">
                              {severityStyle.icon}
                              {report.severity}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <p className="font-medium truncate">{report.title}</p>
                            {report.page_url && (
                              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                {report.page_url}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            {report.organization?.name || 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3 text-muted-foreground" />
                            {report.reporter?.full_name || report.reporter?.email || 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusStyle.color}>
                            <span className="flex items-center gap-1">
                              {statusStyle.icon}
                              {statusStyle.label}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Bug Report?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this bug report. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteBugReport.mutate(report.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <BugReportDetailDialog 
        bug={selectedBug}
        open={!!selectedBug}
        onOpenChange={(open) => !open && setSelectedBug(null)}
      />
    </div>
  );
};

export default BugReportsTab;
