import React, { useState } from 'react';
import { InboxThread, ThreadMessage, ThreadReservation } from '@/hooks/useGuestInbox';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Send,
  AlarmClock,
  MoreHorizontal
} from 'lucide-react';
import { format, addHours } from 'date-fns';
import { cn } from '@/lib/utils';
import ThreadReplyComposer from './ThreadReplyComposer';

interface MessageThreadProps {
  thread: InboxThread;
  messages: ThreadMessage[];
  reservations: ThreadReservation[];
  loading: boolean;
  onStatusChange: (status: InboxThread['status']) => Promise<void>;
  onSnooze: (until: Date | null) => Promise<void>;
  onRefresh: () => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  thread,
  messages,
  reservations,
  loading,
  onStatusChange,
  onSnooze,
  onRefresh,
}) => {
  const { organization } = useCurrentOrganization();
  const [showComposer, setShowComposer] = useState(false);

  const isSnoozed = thread.snoozed_until && new Date(thread.snoozed_until) > new Date();

  const handleToggleStar = () => {
    const newStatus = thread.status === 'starred' ? 'active' : 'starred';
    onStatusChange(newStatus);
  };

  const handleMarkResolved = () => {
    onStatusChange(thread.status === 'resolved' ? 'active' : 'resolved');
  };

  const handleSnooze = (hours: number | null) => {
    if (hours === null) {
      onSnooze(null);
    } else {
      onSnooze(addHours(new Date(), hours));
    }
  };

  // Use first reservation as selected if available
  const [selectedReservationId] = useState<string>(reservations[0]?.id || '');

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header with actions */}
      <div className="p-4 border-b flex items-center justify-between bg-background shrink-0">
        <div className="flex items-center gap-3">
          {thread.guest_email && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {thread.guest_email}
            </span>
          )}
          {thread.guest_phone && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {thread.guest_phone}
            </span>
          )}
          {isSnoozed && (
            <Badge variant="outline" className="text-xs">
              <AlarmClock className="h-3 w-3 mr-1" />
              Snoozed until {format(new Date(thread.snoozed_until!), 'MMM d, h:mm a')}
            </Badge>
          )}
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
        {loading ? (
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
                  {/* Message type indicator */}
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
      <div className="border-t p-4 bg-background shrink-0">
        {showComposer ? (
          <ThreadReplyComposer
            thread={thread}
            reservations={reservations}
            onSent={() => {
              setShowComposer(false);
              onRefresh();
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
  );
};

export default MessageThread;
