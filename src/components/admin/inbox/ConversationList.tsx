import React from 'react';
import { InboxThread } from '@/hooks/useGuestInbox';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Star, Clock, MessageSquare, AlarmClock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationListProps {
  threads: InboxThread[];
  loading: boolean;
  selectedThreadId?: string;
  onSelectThread: (thread: InboxThread) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  threads,
  loading,
  selectedThreadId,
  onSelectThread,
}) => {
  if (loading) {
    return (
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {threads.length} conversation{threads.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Thread list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {threads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors',
                  'hover:bg-muted/50',
                  selectedThreadId === thread.id && 'bg-muted',
                  !thread.is_read && 'bg-primary/5 hover:bg-primary/10'
                )}
              >
                {/* Guest name and status */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'font-medium truncate flex-1',
                    !thread.is_read && 'font-semibold'
                  )}>
                    {thread.guest_name || thread.guest_email || thread.guest_phone || 'Unknown Guest'}
                  </span>
                  {thread.status === 'starred' && (
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                  )}
                  {thread.snoozed_until && new Date(thread.snoozed_until) > new Date() && (
                    <AlarmClock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  {thread.status === 'awaiting_reply' && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 text-orange-600 border-orange-300">
                      <Clock className="h-3 w-3 mr-0.5" />
                      Awaiting
                    </Badge>
                  )}
                  {!thread.is_read && (
                    <span className="h-2 w-2 bg-primary rounded-full" />
                  )}
                </div>

                {/* Contact info icons */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  {thread.guest_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate max-w-[120px]">{thread.guest_email}</span>
                    </span>
                  )}
                  {thread.guest_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                    </span>
                  )}
                </div>

                {/* Last message preview */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate flex-1">
                    {thread.last_message_preview || 'No messages yet'}
                  </span>
                  {thread.last_message_at && (
                    <span className="text-muted-foreground ml-2 shrink-0">
                      {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
