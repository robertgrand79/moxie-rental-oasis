import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGuestInbox, InboxThread, ThreadMessage, ThreadReservation } from '@/hooks/useGuestInbox';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ReservationSidebar from '@/components/admin/inbox/ReservationSidebar';
import GuestDetailSidebar from '@/components/admin/inbox/GuestDetailSidebar';
import MessageThread from '@/components/admin/inbox/MessageThread';

const ConversationDetailPage = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { organization } = useCurrentOrganization();
  
  const {
    threads,
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

  // Find thread from loaded threads
  useEffect(() => {
    if (threadId && threads.length > 0) {
      const foundThread = threads.find(t => t.id === threadId);
      if (foundThread) {
        setThread(foundThread);
        setAiSummary(foundThread.ai_summary);
        if (!foundThread.is_read) {
          markAsRead(foundThread.id);
        }
      }
    }
  }, [threadId, threads, markAsRead]);

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
      <div className="border-b px-4 py-3 flex items-center gap-4 bg-background shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/host/inbox')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          All Messages
        </Button>
        <div className="text-lg font-semibold">
          {thread.guest_name || thread.guest_email || 'Guest'}
        </div>
      </div>

      {/* 3-column layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left sidebar - Reservation details */}
        <ReservationSidebar
          thread={thread}
          reservations={reservations}
          loading={loadingData}
        />

        {/* Center - Message thread */}
        <MessageThread
          thread={thread}
          messages={messages}
          reservations={reservations}
          loading={loadingData}
          onStatusChange={handleStatusChange}
          onSnooze={handleSnooze}
          onRefresh={loadThreadData}
        />

        {/* Right sidebar - Guest details & AI */}
        <GuestDetailSidebar
          thread={thread}
          messages={messages}
          aiSummary={aiSummary}
          onGenerateSummary={handleGenerateSummary}
        />
      </div>
    </div>
  );
};

export default ConversationDetailPage;
