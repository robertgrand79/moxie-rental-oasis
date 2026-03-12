import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestInbox, InboxThread } from '@/hooks/useGuestInbox';
import InboxSidebar from '@/components/admin/inbox/InboxSidebar';
import InboxConversationList from '@/components/admin/inbox/InboxConversationList';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Filter, CheckSquare, X, MailCheck, Archive, Trash2 } from 'lucide-react';

const InboxPage = () => {
  const navigate = useNavigate();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isBulkActing, setIsBulkActing] = useState(false);

  const {
    threads,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    hideUnknown,
    setHideUnknown,
    getUnreadCount,
    getSnoozedCount,
    bulkMarkAsRead,
    bulkArchiveThreads,
    bulkDeleteThreads,
  } = useGuestInbox();

  const handleSelectThread = (thread: InboxThread) => {
    navigate(`/admin/host/inbox/${thread.id}`);
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setFilterSheetOpen(false);
  };

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const handleToggleSelect = useCallback((threadId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(threadId)) {
        next.delete(threadId);
      } else {
        next.add(threadId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === threads.length) {
        return new Set();
      }
      return new Set(threads.map(t => t.id));
    });
  }, [threads]);

  const handleBulkMarkRead = useCallback(async () => {
    setIsBulkActing(true);
    const ids = Array.from(selectedIds);
    const success = await bulkMarkAsRead(ids);
    if (success) {
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
    setIsBulkActing(false);
  }, [selectedIds, bulkMarkAsRead]);

  const handleBulkArchive = useCallback(async () => {
    setIsBulkActing(true);
    const ids = Array.from(selectedIds);
    const success = await bulkArchiveThreads(ids);
    if (success) {
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
    setIsBulkActing(false);
  }, [selectedIds, bulkArchiveThreads]);

  const handleBulkDelete = useCallback(async () => {
    setIsBulkActing(true);
    const ids = Array.from(selectedIds);
    const success = await bulkDeleteThreads(ids);
    if (success) {
      setSelectedIds(new Set());
      setSelectionMode(false);
    }
    setIsBulkActing(false);
    setDeleteConfirmOpen(false);
  }, [selectedIds, bulkDeleteThreads]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Bulk Action Bar */}
      {selectionMode && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b shrink-0">
          <span className="text-sm font-medium mr-2">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select conversations'}
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkMarkRead}
            disabled={selectedIds.size === 0 || isBulkActing}
            className="gap-1.5"
          >
            <MailCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Mark Read</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkArchive}
            disabled={selectedIds.size === 0 || isBulkActing}
            className="gap-1.5"
          >
            <Archive className="h-4 w-4" />
            <span className="hidden sm:inline">Archive</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteConfirmOpen(true)}
            disabled={selectedIds.size === 0 || isBulkActing}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSelectionMode}
            className="gap-1.5 ml-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <InboxSidebar
            filter={filter}
            onFilterChange={setFilter}
            unreadCount={getUnreadCount()}
            snoozedCount={getSnoozedCount()}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            hideUnknown={hideUnknown}
            onHideUnknownChange={setHideUnknown}
          />
        </div>

        {/* Mobile filter button + sheet */}
        <div className="md:hidden absolute top-2 right-2 z-10">
          <div className="flex gap-2">
            {!selectionMode && (
              <Button variant="outline" size="sm" className="gap-2" onClick={toggleSelectionMode}>
                <CheckSquare className="h-4 w-4" />
                Select
              </Button>
            )}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <InboxSidebar
                  filter={filter}
                  onFilterChange={handleFilterChange}
                  unreadCount={getUnreadCount()}
                  snoozedCount={getSnoozedCount()}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  hideUnknown={hideUnknown}
                  onHideUnknownChange={setHideUnknown}
                  isMobile
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Conversation list with select button in header area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Desktop select button */}
          {!selectionMode && !loading && threads.length > 0 && (
            <div className="hidden md:flex items-center justify-end px-4 pt-2">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={toggleSelectionMode}>
                <CheckSquare className="h-4 w-4" />
                Select
              </Button>
            </div>
          )}
          <InboxConversationList
            threads={threads}
            loading={loading}
            onSelectThread={handleSelectThread}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectionMode={selectionMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
          />
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} conversation{selectedIds.size > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected conversations and all their messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkActing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkActing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkActing ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InboxPage;