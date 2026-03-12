import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGuestInbox, InboxThread, ThreadMessage, ThreadReservation } from '@/hooks/useGuestInbox';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, PanelRight } from 'lucide-react';
import ContextSidebar from '@/components/admin/inbox/ContextSidebar';
import ModernMessageThread from '@/components/admin/inbox/ModernMessageThread';
import SmartComposer from '@/components/admin/inbox/SmartComposer';

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
    deleteMessages,
    archiveMessages,
  } = useGuestInbox();

  const [thread, setThread] = useState<InboxThread | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [reservations, setReservations] = useState<ThreadReservation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [sideSheetOpen, setSideSheetOpen] = useState(false);

  useEffect(() => {
    const loadThread = async () => {
      if (!threadId) return;
      const foundThread = threads.find(t => t.id === threadId);
      if (foundThread) {
        setThread(foundThread);
        setAiSummary(foundThread.ai_summary);
        if (!foundThread.is_read) markAsRead(foundThread.id);
        return;
      }
      const fetchedThread = await fetchThreadById(threadId);
      if (fetchedThread) {
        setThread(fetchedThread);
        setAiSummary(fetchedThread.ai_summary);
        if (!fetchedThread.is_read) markAsRead(fetchedThread.id);
      }
    };
    loadThread();
  }, [threadId, threads, fetchThreadById, markAsRead]);

  const loadThreadData = useCallback(async () => {
    if (!thread || !organization?.id) return;
    setLoadingData(true);
    try {
      const [msgs, res] = await Promise.all([
        fetchThreadMessages(thread.id),
        fetchThreadReservations(thread.guest_email, thread.guest_phone, organization.id)
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
    if (summary) setAiSummary(summary);
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
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Minimal top bar */}
      <div className="border-b border-border/40 px-4 py-2.5 flex items-center gap-3 bg-background shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/host/inbox')}
          className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Inbox</span>
        </Button>
        
        <div className="h-4 w-px bg-border/60" />
        
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium truncate block">
            {thread.guest_name || thread.guest_email || 'Guest'}
          </span>
        </div>

        {/* Mobile sidebar trigger */}
        <Sheet open={sideSheetOpen} onOpenChange={setSideSheetOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <PanelRight className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm p-0 border-l border-border/40">
            <ContextSidebar
              thread={thread}
              messages={messages}
              reservations={reservations}
              aiSummary={aiSummary}
              loadingReservations={loadingData}
              onGenerateSummary={handleGenerateSummary}
              onStatusChange={handleStatusChange}
              onSnooze={handleSnooze}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* 2-column layout: 65% messages / 35% context */}
      <div className="flex-1 flex min-h-0">
        {/* Main message area */}
        <div className="flex-1 lg:flex-[65] flex flex-col min-w-0">
          <ModernMessageThread
            thread={thread}
            messages={messages}
            loading={loadingData}
            onStatusChange={handleStatusChange}
            onSnooze={handleSnooze}
          />
          
          <SmartComposer
            thread={thread}
            reservations={reservations}
            onSent={loadThreadData}
          />
        </div>

        {/* Right context sidebar - desktop only */}
        <div className="hidden lg:flex lg:flex-[35] border-l border-border/40">
          <ContextSidebar
            thread={thread}
            messages={messages}
            reservations={reservations}
            aiSummary={aiSummary}
            loadingReservations={loadingData}
            onGenerateSummary={handleGenerateSummary}
            onStatusChange={handleStatusChange}
            onSnooze={handleSnooze}
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationDetailPage;
