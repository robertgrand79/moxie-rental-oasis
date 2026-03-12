import React, { useState } from 'react';
import { InboxThread, ThreadMessage, ThreadReservation } from '@/hooks/useGuestInbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Mail,
  Phone,
  Calendar,
  Home,
  User,
  Sparkles,
  Loader2,
  Star,
  CheckCircle,
  AlarmClock,
  MoreHorizontal,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { format, addHours } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContextSidebarProps {
  thread: InboxThread;
  messages: ThreadMessage[];
  reservations: ThreadReservation[];
  aiSummary: string | null;
  loadingReservations: boolean;
  onGenerateSummary: () => Promise<void>;
  onStatusChange: (status: InboxThread['status']) => Promise<void>;
  onSnooze: (until: Date | null) => Promise<void>;
}

const ContextSidebar: React.FC<ContextSidebarProps> = ({
  thread,
  messages,
  reservations,
  aiSummary,
  loadingReservations,
  onGenerateSummary,
  onStatusChange,
  onSnooze,
}) => {
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    await onGenerateSummary();
    setGeneratingSummary(false);
  };

  const isSnoozed = thread.snoozed_until && new Date(thread.snoozed_until) > new Date();
  const activeReservation = reservations.find(r =>
    r.booking_status === 'confirmed' || r.booking_status === 'pending'
  ) || reservations[0];

  return (
    <ScrollArea className="w-full h-full bg-background">
      <div className="p-5 space-y-6">
        {/* Actions row */}
        <div className="flex items-center gap-2">
          <Button
            variant={thread.status === 'starred' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(thread.status === 'starred' ? 'active' : 'starred')}
            className="h-8 rounded-full"
          >
            <Star className={cn('h-3.5 w-3.5', thread.status === 'starred' && 'fill-current')} />
          </Button>
          <Button
            variant={thread.status === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusChange(thread.status === 'resolved' ? 'active' : 'resolved')}
            className="h-8 rounded-full gap-1.5"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="text-xs">{thread.status === 'resolved' ? 'Resolved' : 'Resolve'}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[1, 4, 24, 72].map(h => (
                <DropdownMenuItem key={h} onClick={() => onSnooze(addHours(new Date(), h))}>
                  <AlarmClock className="h-4 w-4 mr-2" />
                  Snooze {h < 24 ? `${h}h` : `${h / 24}d`}
                </DropdownMenuItem>
              ))}
              {isSnoozed && (
                <DropdownMenuItem onClick={() => onSnooze(null)}>
                  <AlarmClock className="h-4 w-4 mr-2" />
                  Remove snooze
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {isSnoozed && (
            <Badge variant="outline" className="text-xs ml-auto rounded-full">
              <AlarmClock className="h-3 w-3 mr-1" />
              {format(new Date(thread.snoozed_until!), 'MMM d')}
            </Badge>
          )}
        </div>

        {/* --- Reservation Details --- */}
        <section>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Reservation
          </h4>
          {loadingReservations ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : activeReservation ? (
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <Home className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-sm font-medium leading-tight">
                  {activeReservation.property?.title || 'Unknown Property'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(activeReservation.check_in_date), 'MMM d')} → {format(new Date(activeReservation.check_out_date), 'MMM d, yyyy')}
                </span>
              </div>
              <Badge
                variant={activeReservation.booking_status === 'confirmed' ? 'default' : 'secondary'}
                className="rounded-full text-xs"
              >
                {activeReservation.booking_status}
              </Badge>

              {reservations.length > 1 && (
                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground mb-2">{reservations.length - 1} more reservation{reservations.length > 2 ? 's' : ''}</p>
                  {reservations.filter(r => r.id !== activeReservation.id).map(res => (
                    <div key={res.id} className="text-xs text-muted-foreground py-1">
                      {res.property?.title} · {format(new Date(res.check_in_date), 'MMM d')}–{format(new Date(res.check_out_date), 'MMM d')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
              <FileText className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No reservations found</p>
            </div>
          )}
        </section>

        {/* --- Guest Profile --- */}
        <section>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Guest
          </h4>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{thread.guest_name || 'Unknown Guest'}</p>
              </div>
            </div>
            <div className="space-y-2 pt-1">
              {thread.guest_email && (
                <a href={`mailto:${thread.guest_email}`} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{thread.guest_email}</span>
                </a>
              )}
              {thread.guest_phone && (
                <a href={`tel:${thread.guest_phone}`} className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{thread.guest_phone}</span>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* --- AI Summary & Stats --- */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI Summary
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateSummary}
              disabled={generatingSummary || messages.length === 0}
              className="h-7 text-xs rounded-full px-2.5"
            >
              {generatingSummary ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Generate'}
            </Button>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
            {aiSummary ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary}</p>
            ) : (
              <p className="text-sm text-muted-foreground/60 italic">
                {messages.length > 0 ? 'Click generate to summarize this conversation' : 'No messages to summarize'}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4 mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Messages
              </span>
              <span className="font-medium tabular-nums">{messages.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Inbound</span>
              <span className="font-medium tabular-nums">{messages.filter(m => m.direction === 'inbound').length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Outbound</span>
              <span className="font-medium tabular-nums">{messages.filter(m => m.direction === 'outbound').length}</span>
            </div>
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};

export default ContextSidebar;
