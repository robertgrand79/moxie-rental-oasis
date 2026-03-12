import React, { useState, useRef, useEffect } from 'react';
import { InboxThread, ThreadMessage } from '@/hooks/useGuestInbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sanitizeHtml } from '@/utils/security';
import {
  Mail,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ModernMessageThreadProps {
  thread: InboxThread;
  messages: ThreadMessage[];
  loading: boolean;
  onStatusChange: (status: InboxThread['status']) => Promise<void>;
  onSnooze: (until: Date | null) => Promise<void>;
}

/** SMS rendered as sleek chat bubble */
const SmsBubble: React.FC<{ message: ThreadMessage }> = ({ message }) => {
  const isOutbound = message.direction === 'outbound';
  const ts = message.sent_at || message.created_at;

  return (
    <div className={cn('flex', isOutbound ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] px-4 py-2.5 rounded-2xl',
          isOutbound
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <div className={cn(
          'flex items-center gap-1 text-[10px] uppercase tracking-wide font-medium mb-1',
          isOutbound ? 'text-primary-foreground/50' : 'text-muted-foreground/70'
        )}>
          <Phone className="h-2.5 w-2.5" />
          SMS
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.message_content}
        </p>
        <div className={cn(
          'text-[10px] mt-1.5',
          isOutbound ? 'text-primary-foreground/40' : 'text-muted-foreground/50'
        )}>
          {format(new Date(ts), 'MMM d · h:mm a')}
        </div>
      </div>
    </div>
  );
};

/** Email rendered as a full-width card */
const EmailCard: React.FC<{ message: ThreadMessage }> = ({ message }) => {
  const [expanded, setExpanded] = useState(false);
  const isOutbound = message.direction === 'outbound';
  const rawEmail = message.raw_email_data;
  const bodyHtml = rawEmail?.body_html;
  const fromAddress = rawEmail?.from || (isOutbound ? 'You' : message.sender_email || 'Unknown');
  const toAddresses = rawEmail?.to?.join(', ') || (isOutbound ? message.sender_email || '' : 'You');
  const hasAttachments = rawEmail?.has_attachments;
  const subject = message.subject && message.subject !== 'SMS Message' ? message.subject : null;
  const ts = message.sent_at || message.created_at;

  const hasLongBody = bodyHtml && bodyHtml.length > 600;

  return (
    <div className={cn(
      'w-full rounded-xl border border-border/50 bg-background overflow-hidden transition-shadow hover:shadow-sm',
      isOutbound && 'border-l-2 border-l-primary/40'
    )}>
      {/* Email header */}
      <div className="px-4 py-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              'h-6 w-6 rounded-full flex items-center justify-center shrink-0',
              isOutbound ? 'bg-primary/10' : 'bg-muted'
            )}>
              <Mail className="h-3 w-3 text-muted-foreground" />
            </div>
            {subject && (
              <span className="text-sm font-medium truncate">{subject}</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground/60 shrink-0 pt-0.5">
            {format(new Date(ts), 'MMM d · h:mm a')}
          </span>
        </div>
        <div className="flex flex-col gap-0 text-xs text-muted-foreground/70 pl-8">
          <span className="truncate"><span className="font-medium text-muted-foreground">From:</span> {fromAddress}</span>
          <span className="truncate"><span className="font-medium text-muted-foreground">To:</span> {toAddresses}</span>
        </div>
        {hasAttachments && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground/60 pl-8">
            <Paperclip className="h-3 w-3" />
            <span>Attachments</span>
          </div>
        )}
      </div>

      {/* Email body */}
      <div className="px-4 pb-4">
        <div className="border-t border-border/30 pt-3">
          {bodyHtml ? (
            <div className="relative">
              <div
                className={cn(
                  'prose prose-sm max-w-none dark:prose-invert overflow-hidden break-words [&_img]:max-w-full [&_table]:text-sm',
                  !expanded && hasLongBody && 'max-h-[200px]'
                )}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyHtml) }}
              />
              {/* Gradient fade for long emails */}
              {hasLongBody && !expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
              )}
            </div>
          ) : message.message_content ? (
            <p className="text-sm whitespace-pre-wrap break-words text-foreground leading-relaxed">
              {message.message_content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              Email body not available
            </p>
          )}

          {hasLongBody && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs text-muted-foreground hover:text-foreground rounded-full px-3"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show Full Email
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const ModernMessageThread: React.FC<ModernMessageThreadProps> = ({
  thread,
  messages,
  loading,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea ref={scrollRef} className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground/50">
            <div className="h-6 w-6 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading messages…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground/40">
            <MessageSquare className="h-10 w-10 mx-auto mb-3" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Start a conversation with this guest</p>
          </div>
        ) : (
          <>
            {/* Date grouping could go here in the future */}
            {messages.map((message) =>
              message.message_type === 'email' ? (
                <EmailCard key={message.id} message={message} />
              ) : (
                <SmsBubble key={message.id} message={message} />
              )
            )}
          </>
        )}
      </div>
    </ScrollArea>
  );
};

export default ModernMessageThread;
