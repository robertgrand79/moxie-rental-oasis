import React, { useState } from 'react';
import { ThreadMessage } from '@/hooks/useGuestInbox';
import { sanitizeHtml } from '@/utils/security';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Reply, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EmailMessageCardProps {
  message: ThreadMessage;
  onReply: (message: ThreadMessage) => void;
}

const EmailMessageCard: React.FC<EmailMessageCardProps> = ({ message, onReply }) => {
  const [collapsed, setCollapsed] = useState(false);

  const isOutbound = message.direction === 'outbound';
  const rawEmail = message.raw_email_data;
  const bodyHtml = rawEmail?.body_html;
  const fromAddress = rawEmail?.from || (isOutbound ? 'You' : message.sender_email || 'Unknown');
  const toAddresses = rawEmail?.to?.join(', ') || (isOutbound ? message.sender_email || '' : 'You');
  const hasAttachments = rawEmail?.has_attachments;
  const subject = message.subject && message.subject !== 'SMS Message' ? message.subject : '(No subject)';
  const timestamp = message.sent_at || message.created_at;

  return (
    <Card className={cn(
      'w-full border-l-4',
      isOutbound ? 'border-l-primary/60' : 'border-l-muted-foreground/40'
    )}>
      <CardHeader className="p-3 md:p-4 pb-2 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="shrink-0 text-xs gap-1">
              <Mail className="h-3 w-3" />
              EMAIL
            </Badge>
            <span className="text-sm font-medium truncate">{subject}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <span className="truncate"><span className="font-medium">From:</span> {fromAddress}</span>
          <span className="truncate"><span className="font-medium">To:</span> {toAddresses}</span>
          <span>{format(new Date(timestamp), 'MMM d, yyyy · h:mm a')}</span>
        </div>

        {hasAttachments && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="h-3 w-3" />
            <span>Has attachments</span>
          </div>
        )}
      </CardHeader>

      {!collapsed && (
        <CardContent className="p-3 md:p-4 pt-0">
          <div className="border-t pt-3">
            {bodyHtml ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert overflow-hidden break-words [&_img]:max-w-full [&_table]:text-sm"
                style={{ maxHeight: '500px', overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyHtml) }}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words text-foreground">
                {message.message_content}
              </p>
            )}
          </div>
        </CardContent>
      )}

      <CardFooter className="p-3 md:p-4 pt-0 justify-end">
        {message.direction === 'inbound' && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => onReply(message)}
          >
            <Reply className="h-3 w-3 mr-1" />
            Reply
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EmailMessageCard;