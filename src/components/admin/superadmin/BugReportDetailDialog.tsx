import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Bug, 
  Building2, 
  User, 
  Calendar, 
  ExternalLink,
  Monitor,
  Flame,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useBugReports, BugReport, BugSeverity, BugStatus } from '@/hooks/useBugReports';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface BugReportDetailDialogProps {
  bug: BugReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const severityConfig: Record<BugSeverity, { icon: React.ReactNode; color: string; bgColor: string }> = {
  critical: { icon: <Flame className="h-4 w-4" />, color: 'text-red-600', bgColor: 'bg-red-100' },
  high: { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  medium: { icon: <AlertCircle className="h-4 w-4" />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  low: { icon: <Info className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
};

const statusOptions: { value: BugStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'open', label: 'Open', icon: <AlertCircle className="h-4 w-4" /> },
  { value: 'in_progress', label: 'In Progress', icon: <Clock className="h-4 w-4" /> },
  { value: 'resolved', label: 'Resolved', icon: <CheckCircle className="h-4 w-4" /> },
  { value: 'closed', label: 'Closed', icon: <XCircle className="h-4 w-4" /> },
  { value: 'wont_fix', label: "Won't Fix", icon: <XCircle className="h-4 w-4" /> },
];

const BugReportDetailDialog: React.FC<BugReportDetailDialogProps> = ({ bug, open, onOpenChange }) => {
  const { updateBugReport } = useBugReports();
  const [status, setStatus] = useState<BugStatus>('open');
  const [adminNotes, setAdminNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (bug) {
      setStatus(bug.status);
      setAdminNotes(bug.admin_notes || '');
      setHasChanges(false);
    }
  }, [bug]);

  const handleStatusChange = (newStatus: BugStatus) => {
    setStatus(newStatus);
    setHasChanges(true);
  };

  const handleNotesChange = (notes: string) => {
    setAdminNotes(notes);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!bug) return;

    const { data: { user } } = await supabase.auth.getUser();
    
    const updates: any = {
      id: bug.id,
      status,
      admin_notes: adminNotes || null,
    };

    // Set resolved info if status changed to resolved
    if (status === 'resolved' && bug.status !== 'resolved') {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = user?.id;
    } else if (status !== 'resolved' && bug.status === 'resolved') {
      updates.resolved_at = null;
      updates.resolved_by = null;
    }

    await updateBugReport.mutateAsync(updates);
    setHasChanges(false);
  };

  if (!bug) return null;

  const severityStyle = severityConfig[bug.severity];
  let browserInfo: any = null;
  try {
    if (bug.browser_info) {
      browserInfo = JSON.parse(bug.browser_info);
    }
  } catch {
    browserInfo = null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Bug Report Details
          </DialogTitle>
          <DialogDescription>
            Review and manage this bug report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{bug.title}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {bug.organization?.name || 'Unknown Org'}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {bug.reporter?.full_name || bug.reporter?.email || 'Unknown'}
                </span>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={`${severityStyle.bgColor} ${severityStyle.color} border-0`}
            >
              <span className="flex items-center gap-1">
                {severityStyle.icon}
                {bug.severity}
              </span>
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <div className="p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap">
              {bug.description}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Submitted</Label>
              <p className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {format(new Date(bug.created_at), 'PPp')}
              </p>
            </div>
            {bug.page_url && (
              <div className="space-y-1">
                <Label className="text-muted-foreground">Page URL</Label>
                <p className="flex items-center gap-1 truncate">
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{bug.page_url}</span>
                </p>
              </div>
            )}
          </div>

          {/* Browser Info */}
          {browserInfo && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Monitor className="h-4 w-4" />
                Browser Information
              </Label>
              <div className="p-3 rounded-lg bg-muted text-xs font-mono space-y-1">
                <p><strong>Platform:</strong> {browserInfo.platform}</p>
                <p><strong>Screen:</strong> {browserInfo.screenSize}</p>
                <p><strong>Window:</strong> {browserInfo.windowSize}</p>
                <p><strong>Language:</strong> {browserInfo.language}</p>
                <p className="break-all"><strong>User Agent:</strong> {browserInfo.userAgent}</p>
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v: BugStatus) => handleStatusChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea
              placeholder="Add notes about this bug report, resolution details, etc..."
              value={adminNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={3}
            />
          </div>

          {/* Resolution Info */}
          {bug.resolved_at && bug.resolver && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-sm">
              <p className="flex items-center gap-1 text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                Resolved by {bug.resolver.full_name} on {format(new Date(bug.resolved_at), 'PPp')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || updateBugReport.isPending}
          >
            {updateBugReport.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BugReportDetailDialog;
