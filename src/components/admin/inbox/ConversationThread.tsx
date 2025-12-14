import React, { useState, useEffect, useCallback } from 'react';
import { InboxThread, ThreadMessage, ThreadReservation } from '@/hooks/useGuestInbox';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Star, 
  CheckCircle, 
  Mail, 
  Phone, 
  MessageSquare,
  Calendar,
  Home,
  Send,
  Sparkles,
  AlarmClock,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format, addHours, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import ThreadReplyComposer from './ThreadReplyComposer';

interface ConversationThreadProps {
  thread: InboxThread | null;
  onStatusChange: (threadId: string, status: InboxThread['status']) => Promise<boolean>;
  onSnooze: (threadId: string, until: Date | null) => Promise<boolean>;
  onGenerateSummary: (threadId: string, messages: ThreadMessage[]) => Promise<string | null>;
  fetchMessages: (threadId: string) => Promise<ThreadMessage[]>;
  fetchReservations: (guestEmail: string, organizationId: string) => Promise<ThreadReservation[]>;
}

const ConversationThread: React.FC<ConversationThreadProps> = ({
  thread,
  onStatusChange,
  onSnooze,
  onGenerateSummary,
  fetchMessages,
  fetchReservations,
}) => {
  const { organization } = useCurrentOrganization();
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [reservations, setReservations] = useState<ThreadReservation[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const loadThreadData = useCallback(async () => {
    if (!thread || !organization?.id) return;

    setLoadingMessages(true);
    setAiSummary(thread.ai_summary);
    try {
      const [msgs, res] = await Promise.all([
        fetchMessages(thread.id),
        thread.guest_email 
          ? fetchReservations(thread.guest_email, organization.id) 
          : Promise.resolve([])
      ]);
      setMessages(msgs);
      setReservations(res);
    } finally {
      setLoadingMessages(false);
    }
  }, [thread, organization?.id, fetchMessages, fetchReservations]);

  useEffect(() => {
    loadThreadData();
  }, [loadThreadData]);

  const handleGenerateSummary = async () => {
    if (!thread || messages.length === 0) return;
    setGeneratingSummary(true);
    const summary = await onGenerateSummary(thread.id, messages);
    if (summary) {
      setAiSummary(summary);
    }
    setGeneratingSummary(false);
  };

  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/10">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a guest from the list to view their messages</p>
        </div>
      </div>
    );
  }

  const handleToggleStar = () => {
    const newStatus = thread.status === 'starred' ? 'active' : 'starred';
    onStatusChange(thread.id, newStatus);
  };

  const handleMarkResolved = () => {
    onStatusChange(thread.id, thread.status === 'resolved' ? 'active' : 'resolved');
  };

  const handleSnooze = (hours: number | null) => {
    if (hours === null) {
      onSnooze(thread.id, null);
    } else {
      onSnooze(thread.id, addHours(new Date(), hours));
    }
  };

  const isSnoozed = thread.snoozed_until && new Date(thread.snoozed_until) > new Date();

  return (
    <div className="flex-1 flex">
      {/* Main conversation area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {thread.guest_name || thread.guest_email || 'Unknown Guest'}
              {isSnoozed && (
                <Badge variant="outline" className="text-xs">
                  <AlarmClock className="h-3 w-3 mr-1" />
                  Snoozed until {format(new Date(thread.snoozed_until!), 'MMM d, h:mm a')}
                </Badge>
              )}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {thread.guest_email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {thread.guest_email}
                </span>
              )}
              {thread.guest_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {thread.guest_phone}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={thread.status === 'starred' ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleStar}
            >
              <Star className={cn(
                'h-4 w-4',
                thread.status === 'starred' && 'fill-current'
              )} />
            </Button>
            <Button
              variant={thread.status === 'resolved' ? 'default' : 'outline'}
              size="sm"
              onClick={handleMarkResolved}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              {thread.status === 'resolved' ? 'Resolved' : 'Resolve'}
            </Button>
            
            {/* More actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSnooze(1)}>
                  <AlarmClock className="h-4 w-4 mr-2" />
                  Snooze 1 hour
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(4)}>
                  <AlarmClock className="h-4 w-4 mr-2" />
                  Snooze 4 hours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(24)}>
                  <AlarmClock className="h-4 w-4 mr-2" />
                  Snooze 1 day
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSnooze(72)}>
                  <AlarmClock className="h-4 w-4 mr-2" />
                  Snooze 3 days
                </DropdownMenuItem>
                {isSnoozed && (
                  <DropdownMenuItem onClick={() => handleSnooze(null)}>
                    <AlarmClock className="h-4 w-4 mr-2" />
                    Remove snooze
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {loadingMessages ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No messages in this thread yet</p>
              <p className="text-sm">Start a conversation with this guest</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[70%] rounded-lg p-3',
                      message.direction === 'outbound'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {/* Message type and source indicator */}
                    <div className={cn(
                      'flex items-center gap-1 text-xs mb-1',
                      message.direction === 'outbound' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {message.message_type === 'sms' ? (
                        <Phone className="h-3 w-3" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      <span>{message.message_type.toUpperCase()}</span>
                      {message.source_platform && message.source_platform !== 'direct' && (
                        <Badge variant="outline" className="ml-1 text-xs py-0 h-4">
                          {message.source_platform}
                        </Badge>
                      )}
                      {message.subject && message.subject !== 'SMS Message' && (
                        <span className="ml-1">• {message.subject}</span>
                      )}
                    </div>
                    
                    {/* Message content */}
                    <p className="text-sm whitespace-pre-wrap">{message.message_content}</p>
                    
                    {/* Timestamp */}
                    <div className={cn(
                      'text-xs mt-1',
                      message.direction === 'outbound' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    )}>
                      {message.sent_at 
                        ? format(new Date(message.sent_at), 'MMM d, h:mm a')
                        : format(new Date(message.created_at), 'MMM d, h:mm a')
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Reply composer */}
        <div className="border-t p-4">
          {showComposer ? (
            <ThreadReplyComposer
              thread={thread}
              reservations={reservations}
              onSent={() => {
                setShowComposer(false);
                loadThreadData();
              }}
              onCancel={() => setShowComposer(false)}
            />
          ) : (
            <Button
              className="w-full"
              onClick={() => setShowComposer(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Reply to Guest
            </Button>
          )}
        </div>
      </div>

      {/* Right sidebar - Guest details */}
      <div className="w-72 border-l bg-muted/10 p-4 space-y-4 overflow-y-auto">
        {/* AI Summary */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm text-muted-foreground">AI Summary</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGenerateSummary}
              disabled={generatingSummary || messages.length === 0}
            >
              {generatingSummary ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          {aiSummary ? (
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
              {aiSummary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {messages.length > 0 
                ? 'Click the sparkle to generate a summary'
                : 'No messages to summarize'
              }
            </p>
          )}
        </div>

        <Separator />

        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Guest Info</h4>
          <div className="space-y-2 text-sm">
            {thread.guest_name && (
              <p className="font-medium">{thread.guest_name}</p>
            )}
            {thread.guest_email && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {thread.guest_email}
              </p>
            )}
            {thread.guest_phone && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {thread.guest_phone}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Reservations ({reservations.length})
          </h4>
          {reservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reservations found</p>
          ) : (
            <div className="space-y-3">
              {reservations.map((res) => (
                <div key={res.id} className="p-2 bg-background rounded-lg border text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium truncate">
                      {res.property?.title || 'Unknown Property'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(res.check_in_date), 'MMM d')} - {format(new Date(res.check_out_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <Badge 
                    variant={res.booking_status === 'confirmed' ? 'default' : 'secondary'}
                    className="mt-2 text-xs"
                  >
                    {res.booking_status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationThread;
