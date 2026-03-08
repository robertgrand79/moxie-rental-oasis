import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Paperclip } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { PlatformEmail } from '@/hooks/usePlatformEmails';

interface EmailListProps {
  emails: PlatformEmail[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
  isLoading: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  selectionMode?: boolean;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  isLoading,
  selectedIds = new Set(),
  onToggleSelect,
  selectionMode = false,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'MMM d');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No emails found
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="divide-y">
        {emails.map(email => (
          <div
            key={email.id}
            onClick={(e) => {
              // Don't select email if clicking the checkbox
              if ((e.target as HTMLElement).closest('[data-checkbox]')) return;
              onSelectEmail(email.id);
            }}
            className={cn(
              'p-3 cursor-pointer hover:bg-muted/50 transition-colors',
              selectedEmailId === email.id && 'bg-muted',
              !email.is_read && 'bg-primary/5',
              selectedIds.has(email.id) && 'bg-accent/50'
            )}
          >
            <div className="flex items-start gap-2">
              {selectionMode && onToggleSelect && (
                <div data-checkbox className="pt-0.5 shrink-0">
                  <Checkbox
                    checked={selectedIds.has(email.id)}
                    onCheckedChange={() => onToggleSelect(email.id)}
                    className="h-4 w-4"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm truncate',
                    !email.is_read && 'font-semibold'
                  )}>
                    {email.direction === 'inbound' ? email.from_address : email.to_addresses?.[0]}
                  </span>
                  {email.is_starred && (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                  )}
                </div>
                <div className={cn(
                  'text-sm truncate mt-0.5',
                  !email.is_read ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {email.subject || '(No subject)'}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {email.body_text?.substring(0, 80) || email.body_html?.replace(/<[^>]*>/g, '').substring(0, 80)}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {formatDate(email.created_at)}
                </span>
                <div className="flex items-center gap-1">
                  {email.attachments && email.attachments.length > 0 && (
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                  )}
                  {!email.is_read && (
                    <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default EmailList;
