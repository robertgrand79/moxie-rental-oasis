import React from 'react';
import { InboxThread } from '@/hooks/useGuestInbox';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Star, Clock, MessageSquare, AlarmClock, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InboxConversationListProps {
  threads: InboxThread[];
  loading: boolean;
  onSelectThread: (thread: InboxThread) => void;
}

const InboxConversationList: React.FC<InboxConversationListProps> = ({
  threads,
  loading,
  onSelectThread,
}) => {
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Guest Conversations</h2>
        <span className="text-sm text-muted-foreground">
          {threads.length} conversation{threads.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Thread list - full width */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {threads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No conversations found</p>
              <p className="text-sm">Messages from guests will appear here</p>
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread)}
                className={cn(
                  'w-full text-left p-4 rounded-lg transition-colors',
                  'hover:bg-muted/50 border',
                  !thread.is_read && 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar placeholder */}
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {(thread.guest_name?.[0] || thread.guest_email?.[0] || '?').toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top row: name and indicators */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'font-medium text-base truncate',
                        !thread.is_read && 'font-semibold'
                      )}>
                        {thread.guest_name || thread.guest_email || thread.guest_phone || 'Unknown Guest'}
                      </span>
                      {thread.status === 'starred' && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 shrink-0" />
                      )}
                      {thread.snoozed_until && new Date(thread.snoozed_until) > new Date() && (
                        <AlarmClock className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      {thread.status === 'awaiting_reply' && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 text-orange-600 border-orange-300 shrink-0">
                          <Clock className="h-3 w-3 mr-0.5" />
                          Awaiting
                        </Badge>
                      )}
                      {!thread.is_read && (
                        <span className="h-2.5 w-2.5 bg-primary rounded-full shrink-0" />
                      )}
                    </div>

                    {/* Contact info */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                      {thread.guest_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[200px]">{thread.guest_email}</span>
                        </span>
                      )}
                      {thread.guest_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{thread.guest_phone}</span>
                        </span>
                      )}
                    </div>

                    {/* Last message preview */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {thread.last_message_preview || 'No messages yet'}
                    </p>
                  </div>

                  {/* Right side: time and arrow */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {thread.last_message_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                      </span>
                    )}
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default InboxConversationList;
