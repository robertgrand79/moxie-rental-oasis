import React, { useState, useRef, useMemo } from 'react';
import { InboxThread, ThreadMessage, ThreadReservation } from '@/hooks/useGuestInbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EmailMessageCard from './EmailMessageCard';
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
  MoreHorizontal,
  Reply
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
  const [showComposer, setShowComposer] = useState(false);
  const [replyContext, setReplyContext] = useState<ThreadMessage | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const isSnoozed = thread.snoozed_until && new Date(thread.snoozed_until) > new Date();

  const handleQuickReply = (message: ThreadMessage) => {
    setReplyContext(message);
    setShowComposer(true);
    setTimeout(() => {
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

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

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header with actions - responsive */}
      <div className="p-2 md:p-4 border-b flex items-center justify-between bg-background shrink-0 gap-2">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 overflow-hidden">
          {thread.guest_email && (
            <span className="hidden sm:flex items-center gap-1 text-xs md:text-sm text-muted-foreground truncate">
              <Mail className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
              <span className="truncate max-w-[120px] md:max-w-[200px]">{thread.guest_email}</span>
            </span>
          )}
          {thread.guest_phone && (
            <span className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {thread.guest_phone}
            </span>
          )}
          {isSnoozed && (
            <Badge variant="outline" className="text-xs shrink-0">
              <AlarmClock className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Until {format(new Date(thread.snoozed_until!), 'MMM d')}</span>
              <span className="sm:hidden">Snoozed</span>
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button
            variant={thread.status === 'starred' ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleStar}
            className="h-8 w-8 md:h-9 md:w-auto md:px-3 p-0"
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
            className="h-8 md:h-9"
          >
            <CheckCircle className="h-4 w-4 md:mr-1" />
            <span className="hidden md:inline">{thread.status === 'resolved' ? 'Resolved' : 'Resolve'}</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 md:h-9 md:w-9 p-0">
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

      {/* Messages - scrollable area */}
      <ScrollArea className="flex-1 p-3 md:p-4">
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
          <div className="space-y-3 md:space-y-4">
            {messages.map((message) => (
              message.message_type === 'email' ? (
                <EmailMessageCard
                  key={message.id}
                  message={message}
                  onReply={handleQuickReply}
                />
              ) : (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] md:max-w-[70%] rounded-lg p-2.5 md:p-3',
                      message.direction === 'outbound'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className={cn(
                      'flex items-center gap-1 text-xs mb-1',
                      message.direction === 'outbound' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      <Phone className="h-3 w-3" />
                      <span>SMS</span>
                      {message.source_platform && message.source_platform !== 'direct' && (
                        <Badge variant="outline" className="ml-1 text-xs py-0 h-4">
                          {message.source_platform}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap break-words">{message.message_content}</p>
                    
                    <div className={cn(
                      'flex items-center justify-between gap-2 text-xs mt-1',
                      message.direction === 'outbound' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    )}>
                      <span>
                        {message.sent_at 
                          ? format(new Date(message.sent_at), 'MMM d, h:mm a')
                          : format(new Date(message.created_at), 'MMM d, h:mm a')
                        }
                      </span>
                      {message.direction === 'inbound' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs opacity-70 hover:opacity-100 -mr-1"
                          onClick={() => handleQuickReply(message)}
                        >
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Reply composer - sticky at bottom with safe area padding */}
      <div ref={composerRef} className="border-t p-3 md:p-4 bg-background shrink-0 pb-safe">
        {showComposer ? (
          <ThreadReplyComposer
            thread={thread}
            reservations={reservations}
            replyToMessage={replyContext}
            onSent={() => {
              setShowComposer(false);
              setReplyContext(null);
              onRefresh();
            }}
            onCancel={() => {
              setShowComposer(false);
              setReplyContext(null);
            }}
          />
        ) : (
          <Button
            className="w-full h-11 md:h-10"
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
