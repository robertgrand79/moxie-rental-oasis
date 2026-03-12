import React, { useState, useRef, useEffect } from 'react';
import { InboxThread, ThreadMessage } from '@/hooks/useGuestInbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { sanitizeHtml } from '@/utils/security';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Mail,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Paperclip,
  Trash2,
  Archive,
  X,
  CheckSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ModernMessageThreadProps {
  thread: InboxThread;
  messages: ThreadMessage[];
  loading: boolean;
  onStatusChange: (status: InboxThread['status']) => Promise<void>;
  onSnooze: (until: Date | null) => Promise<void>;
  onDeleteMessages?: (ids: string[]) => Promise<boolean>;
  onArchiveMessages?: (ids: string[]) => Promise<boolean>;
  onRefresh?: () => void;
}

/** SMS rendered as sleek chat bubble */
const SmsBubble: React.FC<{
  message: ThreadMessage;
  selected: boolean;
  selectMode: boolean;
  onToggleSelect: (id: string) => void;
}> = ({ message, selected, selectMode, onToggleSelect }) => {
  const isOutbound = message.direction === 'outbound';
  const ts = message.sent_at || message.created_at;

  return (
    <div className={cn('flex gap-2 group', isOutbound ? 'justify-end' : 'justify-start')}>
      {selectMode && !isOutbound && (
        <div className="flex items-start pt-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(message.id)}
            className="h-4 w-4"
          />
        </div>
      )}
      <div
        className={cn(
          'max-w-[75%] px-4 py-3 rounded-2xl transition-shadow',
          isOutbound
            ? 'bg-primary text-primary-foreground rounded-br-lg'
            : 'bg-muted/60 text-foreground rounded-bl-lg',
          selected && 'ring-2 ring-primary/30'
        )}
      >
        <div className={cn(
          'flex items-center gap-1 text-[10px] uppercase tracking-widest font-medium mb-1.5',
          isOutbound ? 'text-primary-foreground/40' : 'text-muted-foreground/50'
        )}>
          <Phone className="h-2.5 w-2.5" strokeWidth={1.5} />
          SMS
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.message_content}
        </p>
        <div className={cn(
          'text-[10px] mt-2',
          isOutbound ? 'text-primary-foreground/30' : 'text-muted-foreground/40'
        )}>
          {format(new Date(ts), 'MMM d · h:mm a')}
        </div>
      </div>
      {selectMode && isOutbound && (
        <div className="flex items-start pt-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect(message.id)}
            className="h-4 w-4"
          />
        </div>
      )}
    </div>
  );
};

/** Email rendered as a full-width card */
const EmailCard: React.FC<{
  message: ThreadMessage;
  selected: boolean;
  selectMode: boolean;
  onToggleSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}> = ({ message, selected, selectMode, onToggleSelect, onDelete }) => {
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
      'w-full rounded-xl border border-border/30 bg-background overflow-hidden transition-all duration-200 hover:shadow-sm group relative',
      isOutbound && 'border-l-2 border-l-primary/30',
      selected && 'ring-2 ring-primary/30'
    )}>
      {/* Email header */}
      <div className="px-5 py-4 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {selectMode && (
              <Checkbox
                checked={selected}
                onCheckedChange={() => onToggleSelect(message.id)}
                className="h-4 w-4 shrink-0"
              />
            )}
            <div className={cn(
              'h-7 w-7 rounded-full flex items-center justify-center shrink-0',
              isOutbound ? 'bg-primary/5' : 'bg-muted/60'
            )}>
              <Mail className="h-3.5 w-3.5 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            {subject && (
              <span className="text-sm font-medium tracking-tight truncate">{subject}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-muted-foreground/50 pt-0.5">
              {format(new Date(ts), 'MMM d · h:mm a')}
            </span>
            {!selectMode && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive rounded-full"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this email message. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(message.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-0 text-xs text-muted-foreground/50 pl-9">
          <span className="truncate"><span className="font-medium text-muted-foreground/70">From:</span> {fromAddress}</span>
          <span className="truncate"><span className="font-medium text-muted-foreground/70">To:</span> {toAddresses}</span>
        </div>
        {hasAttachments && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground/40 pl-9">
            <Paperclip className="h-3 w-3" strokeWidth={1.5} />
            <span>Attachments</span>
          </div>
        )}
      </div>

      {/* Email body */}
      <div className="px-5 pb-5">
        <div className="border-t border-border/20 pt-4">
          {bodyHtml ? (
            <div className="relative">
              <div
                className={cn(
                  'prose prose-sm max-w-none dark:prose-invert overflow-hidden break-words [&_img]:max-w-full [&_table]:text-sm',
                  !expanded && hasLongBody && 'max-h-[200px]'
                )}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyHtml) }}
              />
              {hasLongBody && !expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
              )}
            </div>
          ) : message.message_content ? (
            <p className="text-sm whitespace-pre-wrap break-words text-foreground leading-relaxed">
              {message.message_content}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/40 italic">
              Email body not available
            </p>
          )}

          {hasLongBody && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 h-7 text-xs text-muted-foreground hover:text-foreground rounded-full px-3"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <><ChevronUp className="h-3 w-3 mr-1" strokeWidth={1.5} /> Show Less</>
              ) : (
                <><ChevronDown className="h-3 w-3 mr-1" strokeWidth={1.5} /> Show Full Email</>
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
  onDeleteMessages,
  onArchiveMessages,
  onRefresh,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkArchiving, setBulkArchiving] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    setSelectMode(false);
    setSelectedIds(new Set());
  }, [thread.id]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === messages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(messages.map(m => m.id)));
    }
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (!onDeleteMessages || selectedIds.size === 0) return;
    setBulkDeleting(true);
    const success = await onDeleteMessages(Array.from(selectedIds));
    setBulkDeleting(false);
    if (success) {
      exitSelectMode();
      onRefresh?.();
    }
  };

  const handleBulkArchive = async () => {
    if (!onArchiveMessages || selectedIds.size === 0) return;
    setBulkArchiving(true);
    const success = await onArchiveMessages(Array.from(selectedIds));
    setBulkArchiving(false);
    if (success) {
      exitSelectMode();
      onRefresh?.();
    }
  };

  const handleSingleDelete = async (id: string) => {
    if (!onDeleteMessages) return;
    const success = await onDeleteMessages([id]);
    if (success) onRefresh?.();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Select mode action bar */}
      {selectMode && (
        <div className="px-4 py-2 border-b border-border/30 bg-muted/20 flex items-center gap-3 shrink-0 animate-in slide-in-from-top-2 duration-200">
          <Button variant="ghost" size="sm" onClick={exitSelectMode} className="h-7 w-7 p-0 rounded-full">
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
          <button
            onClick={selectAll}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {selectedIds.size === messages.length ? 'Deselect all' : 'Select all'}
          </button>
          <span className="text-xs text-muted-foreground/60">
            {selectedIds.size} selected
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
              disabled={selectedIds.size === 0 || bulkArchiving}
              className="h-7 text-xs rounded-full gap-1.5 px-3 border-border/40"
            >
              <Archive className="h-3 w-3" strokeWidth={1.5} />
              Archive
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selectedIds.size === 0 || bulkDeleting}
                  className="h-7 text-xs rounded-full gap-1.5 px-3 text-destructive border-destructive/20 hover:bg-destructive/5"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.size} message{selectedIds.size > 1 ? 's' : ''}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the selected messages. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Toggle select mode button */}
      {!selectMode && messages.length > 0 && (
        <div className="px-4 py-1.5 border-b border-border/20 flex justify-end shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectMode(true)}
            className="h-7 text-xs text-muted-foreground/60 hover:text-foreground rounded-full gap-1.5 px-3"
          >
            <CheckSquare className="h-3 w-3" strokeWidth={1.5} />
            Select
          </Button>
        </div>
      )}

      <ScrollArea ref={scrollRef} className="flex-1">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">
          {loading ? (
            <div className="text-center py-16">
              <div className="h-6 w-6 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/50">Loading messages…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-24">
              <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-7 w-7 text-primary/40" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium tracking-tight text-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground/50 mt-1">Start a conversation with this guest</p>
            </div>
          ) : (
            messages.map((message) =>
              message.message_type === 'email' ? (
                <EmailCard
                  key={message.id}
                  message={message}
                  selected={selectedIds.has(message.id)}
                  selectMode={selectMode}
                  onToggleSelect={toggleSelect}
                  onDelete={onDeleteMessages ? handleSingleDelete : undefined}
                />
              ) : (
                <SmsBubble
                  key={message.id}
                  message={message}
                  selected={selectedIds.has(message.id)}
                  selectMode={selectMode}
                  onToggleSelect={toggleSelect}
                />
              )
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ModernMessageThread;
