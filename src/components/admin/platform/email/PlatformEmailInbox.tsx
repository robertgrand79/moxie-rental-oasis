import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Inbox, Send, Star, Archive, RefreshCw, Plus } from 'lucide-react';
import { usePlatformEmails } from '@/hooks/usePlatformEmails';
import { usePlatformEmailAddresses } from '@/hooks/usePlatformEmailAddresses';
import EmailList from './EmailList';
import EmailViewer from './EmailViewer';
import EmailComposer from './EmailComposer';

type Folder = 'inbox' | 'sent' | 'starred' | 'archived';

const PlatformEmailInbox = () => {
  const [selectedFolder, setSelectedFolder] = useState<Folder>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<any>(null);

  const { emails, isLoading, refetch } = usePlatformEmails();
  const { activeAddresses } = usePlatformEmailAddresses();

  // Filter emails based on selected folder
  const filteredEmails = React.useMemo(() => {
    if (!emails) return [];
    
    switch (selectedFolder) {
      case 'inbox':
        return emails.filter(e => e.direction === 'inbound' && !e.is_archived);
      case 'sent':
        return emails.filter(e => e.direction === 'outbound' && !e.is_archived);
      case 'starred':
        return emails.filter(e => e.is_starred && !e.is_archived);
      case 'archived':
        return emails.filter(e => e.is_archived);
      default:
        return emails;
    }
  }, [emails, selectedFolder]);

  const selectedEmail = emails?.find(e => e.id === selectedEmailId);

  // Count unread emails
  const unreadCount = emails?.filter(e => !e.is_read && e.direction === 'inbound' && !e.is_archived).length || 0;

  const folders: { id: Folder; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox className="h-4 w-4" />, count: unreadCount },
    { id: 'sent', label: 'Sent', icon: <Send className="h-4 w-4" /> },
    { id: 'starred', label: 'Starred', icon: <Star className="h-4 w-4" /> },
    { id: 'archived', label: 'Archived', icon: <Archive className="h-4 w-4" /> },
  ];

  const handleReply = (email: any) => {
    setReplyToEmail(email);
    setIsComposing(true);
  };

  const handleCloseComposer = () => {
    setIsComposing(false);
    setReplyToEmail(null);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      {/* Sidebar */}
      <Card className="w-56 shrink-0">
        <CardContent className="p-3 space-y-2">
          <Button
            onClick={() => setIsComposing(true)}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Compose
          </Button>

          <div className="pt-2 space-y-1">
            {folders.map(folder => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setSelectedEmailId(null);
                }}
              >
                {folder.icon}
                <span className="flex-1 text-left">{folder.label}</span>
                {folder.count !== undefined && folder.count > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {folder.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      <Card className="w-80 shrink-0 overflow-hidden">
        <CardContent className="p-0 h-full">
          <EmailList
            emails={filteredEmails}
            selectedEmailId={selectedEmailId}
            onSelectEmail={setSelectedEmailId}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Email Viewer / Composer */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          {isComposing ? (
            <EmailComposer
              replyTo={replyToEmail}
              fromAddresses={activeAddresses}
              onClose={handleCloseComposer}
              onSent={() => {
                handleCloseComposer();
                refetch();
              }}
            />
          ) : selectedEmail ? (
            <EmailViewer
              email={selectedEmail}
              onReply={handleReply}
              onClose={() => setSelectedEmailId(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select an email to view
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformEmailInbox;
