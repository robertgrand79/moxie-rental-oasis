import React, { useState } from 'react';
import { useGuestInbox, InboxThread } from '@/hooks/useGuestInbox';
import InboxSidebar from '@/components/admin/inbox/InboxSidebar';
import ConversationList from '@/components/admin/inbox/ConversationList';
import ConversationThread from '@/components/admin/inbox/ConversationThread';

const InboxPage = () => {
  const {
    threads,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    fetchThreadMessages,
    fetchThreadReservations,
    updateThreadStatus,
    markAsRead,
    getUnreadCount,
  } = useGuestInbox();

  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);

  const handleSelectThread = async (thread: InboxThread) => {
    setSelectedThread(thread);
    if (!thread.is_read) {
      await markAsRead(thread.id);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar with filters */}
      <InboxSidebar
        filter={filter}
        onFilterChange={setFilter}
        unreadCount={getUnreadCount()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Conversation list */}
      <ConversationList
        threads={threads}
        loading={loading}
        selectedThreadId={selectedThread?.id}
        onSelectThread={handleSelectThread}
      />

      {/* Thread detail / conversation view */}
      <ConversationThread
        thread={selectedThread}
        onStatusChange={updateThreadStatus}
        fetchMessages={fetchThreadMessages}
        fetchReservations={fetchThreadReservations}
      />
    </div>
  );
};

export default InboxPage;
