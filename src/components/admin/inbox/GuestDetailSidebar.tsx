import React, { useState } from 'react';
import { InboxThread, ThreadMessage } from '@/hooks/useGuestInbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  Sparkles, 
  User,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestDetailSidebarProps {
  thread: InboxThread;
  messages: ThreadMessage[];
  aiSummary: string | null;
  onGenerateSummary: () => Promise<void>;
  isMobile?: boolean;
}

const GuestDetailSidebar: React.FC<GuestDetailSidebarProps> = ({
  thread,
  messages,
  aiSummary,
  onGenerateSummary,
  isMobile = false,
}) => {
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    await onGenerateSummary();
    setGeneratingSummary(false);
  };

  const content = (
    <div className="p-4 space-y-4">
      {/* About Guest */}
      <div>
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          About Guest
        </h4>
        <div className="bg-background rounded-lg border p-4 space-y-3">
          {/* Avatar / Icon */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {thread.guest_name || 'Unknown Guest'}
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Guest</span>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-2 pt-2">
            {thread.guest_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <a 
                  href={`mailto:${thread.guest_email}`}
                  className="text-primary hover:underline truncate"
                >
                  {thread.guest_email}
                </a>
              </div>
            )}
            {thread.guest_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a 
                  href={`tel:${thread.guest_phone}`}
                  className="text-primary hover:underline"
                >
                  {thread.guest_phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* AI Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Summary
          </h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGenerateSummary}
            disabled={generatingSummary || messages.length === 0}
            className="h-8"
          >
            {generatingSummary ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-xs">Generate</span>
            )}
          </Button>
        </div>
        
        <div className="bg-background rounded-lg border p-3">
          {aiSummary ? (
            <p className="text-sm text-muted-foreground">
              {aiSummary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {messages.length > 0 
                ? 'Click generate to create an AI summary of this conversation'
                : 'No messages to summarize'
              }
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Thread Stats */}
      <div>
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Conversation Stats
        </h4>
        <div className="bg-background rounded-lg border p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Messages</span>
            <span className="font-medium">{messages.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Inbound</span>
            <span className="font-medium">
              {messages.filter(m => m.direction === 'inbound').length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Outbound</span>
            <span className="font-medium">
              {messages.filter(m => m.direction === 'outbound').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return <div className="w-full h-full overflow-auto">{content}</div>;
  }

  return (
    <ScrollArea className="w-80 border-l bg-muted/10">
      {content}
    </ScrollArea>
  );
};

export default GuestDetailSidebar;
