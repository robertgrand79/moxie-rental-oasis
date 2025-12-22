import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bug, AlertTriangle, AlertCircle, Info, Flame } from 'lucide-react';
import { useBugReports, BugSeverity } from '@/hooks/useBugReports';

interface ReportBugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const severityOptions: { value: BugSeverity; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'low', label: 'Low', icon: <Info className="h-4 w-4" />, color: 'text-blue-500' },
  { value: 'medium', label: 'Medium', icon: <AlertCircle className="h-4 w-4" />, color: 'text-yellow-500' },
  { value: 'high', label: 'High', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-orange-500' },
  { value: 'critical', label: 'Critical', icon: <Flame className="h-4 w-4" />, color: 'text-red-500' },
];

const ReportBugDialog: React.FC<ReportBugDialogProps> = ({ open, onOpenChange }) => {
  const location = useLocation();
  const { submitBugReport } = useBugReports();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('medium');

  // Get browser info
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    const browserInfo = {
      userAgent: ua,
      platform: navigator.platform,
      language: navigator.language,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
    };
    return JSON.stringify(browserInfo);
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setSeverity('medium');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) return;

    await submitBugReport.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      severity,
      page_url: location.pathname,
      browser_info: getBrowserInfo(),
    });

    onOpenChange(false);
  };

  const selectedSeverity = severityOptions.find(s => s.value === severity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Report a Bug
          </DialogTitle>
          <DialogDescription>
            Help us improve by reporting any issues you encounter. Our team will review your report.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please describe what happened, what you expected, and steps to reproduce..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select value={severity} onValueChange={(v: BugSeverity) => setSeverity(v)}>
              <SelectTrigger>
                <SelectValue>
                  {selectedSeverity && (
                    <span className={`flex items-center gap-2 ${selectedSeverity.color}`}>
                      {selectedSeverity.icon}
                      {selectedSeverity.label}
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className={`flex items-center gap-2 ${option.color}`}>
                      {option.icon}
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p><strong>Page:</strong> {location.pathname}</p>
            <p className="mt-1 text-xs">Browser info will be included automatically</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitBugReport.isPending || !title.trim() || !description.trim()}>
              {submitBugReport.isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportBugDialog;
