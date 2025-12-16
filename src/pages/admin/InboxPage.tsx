import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestInbox, InboxThread } from '@/hooks/useGuestInbox';
import InboxSidebar from '@/components/admin/inbox/InboxSidebar';
import InboxConversationList from '@/components/admin/inbox/InboxConversationList';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

const InboxPage = () => {
  const navigate = useNavigate();
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
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
  } = useGuestInbox();

  const handleSelectThread = (thread: InboxThread) => {
    navigate(`/admin/host/inbox/${thread.id}`);
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    setFilterSheetOpen(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
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

      {/* Full-width conversation list */}
      <InboxConversationList
        threads={threads}
        loading={loading}
        onSelectThread={handleSelectThread}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  );
};

export default InboxPage;
