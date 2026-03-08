import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Inbox, Send, Star, Archive, RefreshCw, Plus, PanelRight,
  Trash2, CheckSquare, X, CheckCheck,
} from 'lucide-react';
import { usePlatformEmails } from '@/hooks/usePlatformEmails';
import { usePlatformEmailAddresses } from '@/hooks/usePlatformEmailAddresses';
import { useTenantIntelligence } from '@/hooks/useTenantIntelligence';
import EmailList from './EmailList';
import EmailViewer from './EmailViewer';
import EmailComposer from './EmailComposer';
import TenantIntelligenceSidebar from './TenantIntelligenceSidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

type Folder = 'inbox' | 'sent' | 'starred' | 'archived';

const PlatformEmailInbox = () => {
  const [selectedFolder, setSelectedFolder] = useState<Folder>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [replyToEmail, setReplyToEmail] = useState<any>(null);
  const [showTenantSidebar, setShowTenantSidebar] = useState(true);

  // Selection state for mass actions
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { emails, isLoading, refetch, deleteEmail } = usePlatformEmails();
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

  const selectedEmail = emails?.find(e => e.id === selectedEmailId) ?? null;

  // Tenant intelligence for the selected email
  const { tenant, isLoading: isTenantLoading } = useTenantIntelligence(selectedEmail);

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

  // Selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredEmails.map(e => e.id)));
  }, [filteredEmails]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleMassDelete = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      // Delete sequentially to avoid overwhelming the API
      for (const id of ids) {
        await deleteEmail.mutateAsync(id);
      }
      toast.success(`Deleted ${ids.length} email${ids.length > 1 ? 's' : ''}`);
      exitSelectionMode();
      if (selectedEmailId && selectedIds.has(selectedEmailId)) {
        setSelectedEmailId(null);
      }
    } catch (err) {
      toast.error('Failed to delete some emails');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const showSidebar = selectedEmail && !isComposing && showTenantSidebar;

  return (
    <>
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
                    exitSelectionMode();
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

            <div className="pt-4 border-t space-y-1">
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
          <CardContent className="p-0 h-full flex flex-col">
            {/* Selection toolbar */}
            <div className="flex items-center gap-1 p-2 border-b">
              {selectionMode ? (
                <>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={selectAll}>
                    <CheckCheck className="h-3.5 w-3.5" />
                    All
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={deselectAll}>
                    None
                  </Button>
                  <div className="flex-1" />
                  {selectedIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 gap-1 text-xs"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete ({selectedIds.size})
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={exitSelectionMode}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setSelectionMode(true)}
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  Select
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <EmailList
                emails={filteredEmails}
                selectedEmailId={selectedEmailId}
                onSelectEmail={setSelectedEmailId}
                isLoading={isLoading}
                selectionMode={selectionMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            </div>
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
              <div className="h-full flex flex-col">
                {/* Toggle button for tenant sidebar */}
                {!showTenantSidebar && (
                  <div className="flex justify-end p-2 pb-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => setShowTenantSidebar(true)}
                    >
                      <PanelRight className="h-3.5 w-3.5" />
                      Tenant Intel
                    </Button>
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  <EmailViewer
                    email={selectedEmail}
                    onReply={handleReply}
                    onClose={() => setSelectedEmailId(null)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select an email to view
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant Intelligence Sidebar */}
        {showSidebar && (
          <div className="w-64 shrink-0 hidden xl:block">
            <TenantIntelligenceSidebar
              tenant={tenant}
              isLoading={isTenantLoading}
              email={selectedEmail!}
              onCollapse={() => setShowTenantSidebar(false)}
            />
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} email{selectedIds.size > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected emails will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMassDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PlatformEmailInbox;
