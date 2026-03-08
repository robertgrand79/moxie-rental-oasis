import React, { useEffect } from 'react';
import { sanitizeHtml } from '@/utils/security';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Reply,
  Forward,
  Archive,
  Star,
  Trash2,
  X,
  ExternalLink,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';
import { usePlatformEmails, type PlatformEmail } from '@/hooks/usePlatformEmails';
import { toast } from 'sonner';

interface EmailViewerProps {
  email: PlatformEmail;
  onReply: (email: PlatformEmail) => void;
  onClose: () => void;
}

const EmailViewer: React.FC<EmailViewerProps> = ({ email, onReply, onClose }) => {
  const { markAsRead, toggleStarred, toggleArchive, deleteEmail } = usePlatformEmails();

  // Mark as read when viewing
  useEffect(() => {
    if (!email.is_read) {
      markAsRead.mutate({ id: email.id, isRead: true });
    }
  }, [email.id, email.is_read]);

  const handleStar = () => {
    toggleStarred.mutate({ id: email.id, isStarred: !email.is_starred });
  };

  const handleArchive = () => {
    toggleArchive.mutate({ id: email.id, isArchived: true });
    onClose();
  };

  const handleDelete = () => {
    deleteEmail.mutate(email.id);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold truncate max-w-md">
            {email.subject || '(No subject)'}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onReply(email)}>
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Forward className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleStar}
          >
            <Star className={`h-4 w-4 ${email.is_starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleArchive}>
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email Details */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium">
              {email.from_name || email.from_address}
            </div>
            <div className="text-sm text-muted-foreground">
              {email.from_address}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(email.created_at), 'MMM d, yyyy h:mm a')}
          </div>
        </div>
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">To: </span>
          {email.to_addresses?.join(', ')}
        </div>
        {email.linked_inbox_item_id && (
          <div className="mt-2">
            <Badge variant="outline" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              Linked to Ticket
            </Badge>
          </div>
        )}
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="p-3 border-b bg-muted/20">
          <div className="flex items-center gap-2 flex-wrap">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            {(email.attachments as any[]).map((attachment, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {attachment.filename || `Attachment ${index + 1}`}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Email Body */}
      <ScrollArea className="flex-1 p-4">
        {email.body_html ? (
          <div
            className="prose prose-sm max-w-none dark:prose-invert [&_img]:max-w-full [&_table]:text-sm"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.body_html) }}
          />
        ) : email.body_text ? (
          <div className="whitespace-pre-wrap text-sm text-foreground">
            {email.body_text}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic py-8 text-center">
            No email content available
          </div>
        )}
      </ScrollArea>

      {/* Quick Reply */}
      <Separator />
      <div className="p-3">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => onReply(email)}
        >
          <Reply className="h-4 w-4" />
          Reply
        </Button>
      </div>
    </div>
  );
};

export default EmailViewer;
