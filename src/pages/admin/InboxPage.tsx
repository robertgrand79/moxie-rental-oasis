import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestInbox, InboxThread } from '@/hooks/useGuestInbox';
import InboxSidebar from '@/components/admin/inbox/InboxSidebar';
import InboxConversationList from '@/components/admin/inbox/InboxConversationList';

const InboxPage = () => {
  const navigate = useNavigate();
  const {
    threads,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    getUnreadCount,
    getSnoozedCount,
  } = useGuestInbox();

  const handleSelectThread = (thread: InboxThread) => {
    navigate(`/admin/host/inbox/${thread.id}`);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar with filters */}
      <InboxSidebar
        filter={filter}
        onFilterChange={setFilter}
        unreadCount={getUnreadCount()}
        snoozedCount={getSnoozedCount()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Full-width conversation list */}
      <InboxConversationList
        threads={threads}
        loading={loading}
        onSelectThread={handleSelectThread}
      />
    </div>
  );
};

export default InboxPage;
