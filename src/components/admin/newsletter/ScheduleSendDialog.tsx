import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Loader2 } from 'lucide-react';

interface ScheduleSendDialogProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: Date) => Promise<void>;
  recipientCount?: number;
}

// Round a Date to the nearest future :05 — pg_cron ticks every 5 minutes, so
// scheduling more precisely than that is misleading (a 14:32 send actually fires
// at 14:35). Defaulting the picker to a clean :05 boundary makes the UX honest.
const roundUpToNext5Minutes = (d: Date): Date => {
  const next = new Date(d.getTime());
  next.setSeconds(0, 0);
  const m = next.getMinutes();
  const add = (5 - (m % 5)) % 5;
  next.setMinutes(m + (add === 0 ? 5 : add));
  return next;
};

const toLocalInputValue = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const ScheduleSendDialog: React.FC<ScheduleSendDialogProps> = ({ open, onClose, onSchedule, recipientCount }) => {
  const [value, setValue] = useState(() => toLocalInputValue(roundUpToNext5Minutes(new Date(Date.now() + 60 * 60 * 1000))));
  const [saving, setSaving] = useState(false);

  const parsed = new Date(value);
  const isValid = !isNaN(parsed.getTime()) && parsed.getTime() > Date.now() + 60 * 1000;

  const handleConfirm = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await onSchedule(parsed);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule send
          </DialogTitle>
          <DialogDescription>
            We'll send this newsletter automatically at the chosen time
            {typeof recipientCount === 'number' && recipientCount > 0
              ? ` to ${recipientCount} subscriber${recipientCount !== 1 ? 's' : ''}`
              : ''}.
            Times use your local timezone; the cron tick is every 5 minutes so actual
            delivery is accurate to ±5 min.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="schedule-at">Send at</Label>
          <Input
            id="schedule-at"
            type="datetime-local"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={saving}
            min={toLocalInputValue(new Date(Date.now() + 5 * 60 * 1000))}
          />
          {!isValid && (
            <p className="text-xs text-destructive">Pick a time at least one minute in the future.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!isValid || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
