import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGuestInbox, InboxThread, ThreadMessage, ThreadReservation } from '@/hooks/useGuestInbox';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, Calendar, User, Menu } from 'lucide-react';
import ReservationSidebar from '@/components/admin/inbox/ReservationSidebar';
import GuestDetailSidebar from '@/components/admin/inbox/GuestDetailSidebar';
import MessageThread from '@/components/admin/inbox/MessageThread';

const ConversationDetailPage = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { organization } = useCurrentOrganization();
  
  const {
    threads,
    fetchThreadById,
    fetchThreadMessages,
    fetchThreadReservations,
    updateThreadStatus,
    markAsRead,
    snoozeThread,
    generateAISummary,
  } = useGuestInbox();

  const [thread, setThread] = useState<InboxThread | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [reservations, setReservations] = useState<ThreadReservation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'messages' | 'reservation' | 'guest'>('messages');
  const [sideSheetOpen, setSideSheetOpen] = useState(false);

  // Find thread from loaded threads OR fetch directly if not in cache
  useEffect(() => {
    const loadThread = async () => {
      if (!threadId) return;
      
      // First try to find in cached threads
      const foundThread = threads.find(t => t.id === threadId);
      if (foundThread) {
        setThread(foundThread);
        setAiSummary(foundThread.ai_summary);
        if (!foundThread.is_read) {
          markAsRead(foundThread.id);
        }
        return;
      }

      // If not found in cache (e.g., after refresh), fetch directly
      const fetchedThread = await fetchThreadById(threadId);
      if (fetchedThread) {
        setThread(fetchedThread);
        setAiSummary(fetchedThread.ai_summary);
        if (!fetchedThread.is_read) {
          markAsRead(fetchedThread.id);
        }
      }
    };

    loadThread();
  }, [threadId, threads, fetchThreadById, markAsRead]);

  // Load thread data
  const loadThreadData = useCallback(async () => {
    if (!thread || !organization?.id) return;

    setLoadingData(true);
    try {
      const [msgs, res] = await Promise.all([
        fetchThreadMessages(thread.id),
        thread.guest_email 
          ? fetchThreadReservations(thread.guest_email, organization.id) 
          : Promise.resolve([])
      ]);
      setMessages(msgs);
      setReservations(res);
    } finally {
      setLoadingData(false);
    }
  }, [thread, organization?.id, fetchThreadMessages, fetchThreadReservations]);

  useEffect(() => {
    loadThreadData();
  }, [loadThreadData]);

  const handleGenerateSummary = async () => {
    if (!thread || messages.length === 0) return;
    const summary = await generateAISummary(thread.id, messages);
    if (summary) {
      setAiSummary(summary);
    }
  };

  const handleStatusChange = async (status: InboxThread['status']) => {
    if (!thread) return;
    await updateThreadStatus(thread.id, status);
  };

  const handleSnooze = async (until: Date | null) => {
    if (!thread) return;
    await snoozeThread(thread.id, until);
  };

  if (!thread) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top header with back button */}
      <div className="border-b px-3 md:px-4 py-3 flex items-center gap-2 md:gap-4 bg-background shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/host/inbox')}
          className="gap-1 md:gap-2 px-2 md:px-3"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">All Messages</span>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="text-base md:text-lg font-semibold truncate">
            {thread.guest_name || thread.guest_email || 'Guest'}
          </div>
        </div>
        
        {/* Mobile info sheet trigger */}
        <Sheet open={sideSheetOpen} onOpenChange={setSideSheetOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="sm">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm p-0">
            <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as typeof mobileTab)} className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b h-12 px-2">
                <TabsTrigger value="messages" className="gap-1">
                  Messages
                </TabsTrigger>
                <TabsTrigger value="reservation" className="gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Reservation</span>
                </TabsTrigger>
                <TabsTrigger value="guest" className="gap-1">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Guest</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="reservation" className="flex-1 m-0 overflow-auto">
                <ReservationSidebar
                  thread={thread}
                  reservations={reservations}
                  loading={loadingData}
                  isMobile
                />
              </TabsContent>
              <TabsContent value="guest" className="flex-1 m-0 overflow-auto">
                <GuestDetailSidebar
                  thread={thread}
                  messages={messages}
                  aiSummary={aiSummary}
                  onGenerateSummary={handleGenerateSummary}
                  isMobile
                />
              </TabsContent>
              <TabsContent value="messages" className="flex-1 m-0 p-4 text-center text-muted-foreground">
                <p>Close this panel to view messages</p>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: 3-column layout / Mobile: full-width messages */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar - Reservation details (desktop only) */}
        <div className="hidden lg:block">
          <ReservationSidebar
            thread={thread}
            reservations={reservations}
            loading={loadingData}
          />
        </div>

        {/* Center - Message thread (full width on mobile) */}
        <MessageThread
          thread={thread}
          messages={messages}
          reservations={reservations}
          loading={loadingData}
          onStatusChange={handleStatusChange}
          onSnooze={handleSnooze}
          onRefresh={loadThreadData}
        />

        {/* Right sidebar - Guest details & AI (desktop only) */}
        <div className="hidden lg:block">
          <GuestDetailSidebar
            thread={thread}
            messages={messages}
            aiSummary={aiSummary}
            onGenerateSummary={handleGenerateSummary}
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationDetailPage;
