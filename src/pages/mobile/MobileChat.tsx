import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Send, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  thread_id: string;
  message_content: string;
  direction: 'inbound' | 'outbound';
  sent_at: string;
  sender_email: string | null;
}

const MobileChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch guest profile
  const { data: profile } = useQuery({
    queryKey: ['mobile-chat-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('guest_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch reservations to find organization_id
  const { data: reservations = [] } = useQuery({
    queryKey: ['mobile-chat-reservations', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return [];
      const { data, error } = await supabase
        .from('property_reservations')
        .select('*, properties:property_id(title)')
        .eq('guest_email', profile.email)
        .order('check_in_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.email,
  });

  // Load/create thread
  useEffect(() => {
    const initThread = async () => {
      if (!profile || reservations.length === 0) {
        setLoadingMessages(false);
        return;
      }

      try {
        // Find if a thread already exists
        const { data: existingThreads, error: searchError } = await supabase
          .from('guest_inbox_threads')
          .select('id')
          .eq('guest_email', profile.email)
          .limit(1);

        if (searchError) throw searchError;

        if (existingThreads && existingThreads.length > 0) {
          setThreadId(existingThreads[0].id);
        } else {
          // Create new thread using latest reservation's org ID
          const latestReservation = reservations[0];
          const newThreadId = crypto.randomUUID();
          
          const { error: createError } = await supabase
            .from('guest_inbox_threads')
            .insert({
              id: newThreadId,
              organization_id: latestReservation.organization_id,
              guest_identifier: profile.email,
              guest_email: profile.email,
              guest_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Guest User',
              guest_phone: profile.phone,
              status: 'active',
              is_read: false
            });

          if (createError) throw createError;
          setThreadId(newThreadId);
        }
      } catch (err) {
        console.error('Error initializing chat thread:', err);
        toast.error('Could not initialize chat channel.');
      }
    };

    if (profile && reservations.length > 0) {
      initThread();
    } else if (profile && reservations.length === 0) {
      setLoadingMessages(false);
    }
  }, [profile, reservations]);

  // Load messages once thread ID is found
  const fetchMessages = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('guest_communications')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map((m: any) => ({
        id: m.id,
        thread_id: m.thread_id,
        message_content: m.message_content,
        direction: m.direction as 'inbound' | 'outbound',
        sent_at: m.sent_at || m.created_at,
        sender_email: m.sender_email
      })));
    } catch (err) {
      console.error('Error loading chat messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (threadId) {
      fetchMessages(threadId);

      // Subscribe to real-time additions of communications
      const channel = supabase
        .channel(`mobile-thread-${threadId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'guest_communications',
            filter: `thread_id=eq.${threadId}`
          },
          (payload) => {
            const newMessage = payload.new as any;
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [
                ...prev,
                {
                  id: newMessage.id,
                  thread_id: newMessage.thread_id,
                  message_content: newMessage.message_content,
                  direction: newMessage.direction as 'inbound' | 'outbound',
                  sent_at: newMessage.sent_at || newMessage.created_at,
                  sender_email: newMessage.sender_email
                }
              ];
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [threadId]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loadingMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !threadId || !profile || reservations.length === 0) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    try {
      const latestReservation = reservations[0];
      const nowStr = new Date().toISOString();

      // Insert communication message
      const { error: sendError } = await supabase
        .from('guest_communications')
        .insert({
          thread_id: threadId,
          reservation_id: latestReservation.id,
          message_content: messageText,
          direction: 'inbound',
          message_type: 'chat',
          subject: 'Mobile App Chat',
          sent_at: nowStr,
          sender_email: profile.email
        });

      if (sendError) throw sendError;

      // Update thread timestamp & preview
      await supabase
        .from('guest_inbox_threads')
        .update({
          last_message_preview: messageText,
          last_message_at: nowStr,
          is_read: false,
          status: 'awaiting_reply'
        })
        .eq('id', threadId);

      // Local append as optimization
      setMessages((prev) => {
        const dummyId = crypto.randomUUID();
        if (prev.some((m) => m.message_content === messageText && m.sent_at === nowStr)) return prev;
        return [
          ...prev,
          {
            id: dummyId,
            thread_id: threadId,
            message_content: messageText,
            direction: 'inbound',
            sent_at: nowStr,
            sender_email: profile.email
          }
        ];
      });
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (!profile || reservations.length === 0) {
    return (
      <div className="flex-1 p-8 text-center flex flex-col justify-center items-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
          <MessageSquare className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Inbox locked</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[260px] mx-auto leading-relaxed">
            Messaging requires an active or upcoming property reservation. Once you have a stay scheduled, your direct host inbox will open here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-zinc-950">
      {/* Active Conversation Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loadingMessages ? (
          <div className="py-20 text-center flex flex-col justify-center items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Securing conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 px-6 space-y-4">
            <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Conversation started</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                Say hello to your host! Ask about check-in, parking instructions, local hot spots, or early drop-offs.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.direction === 'inbound';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <Avatar className="h-7 w-7 border shadow-sm flex-shrink-0">
                      <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                        H
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col space-y-1 max-w-[75%]">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm'
                          : 'bg-white dark:bg-zinc-900 border text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.message_content}</p>
                    </div>
                    <span
                      className={`text-[9px] text-muted-foreground px-1 ${
                        isMe ? 'text-right' : 'text-left'
                      }`}
                    >
                      {format(new Date(msg.sent_at), 'h:mm a')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input Message Form Footer */}
      <div className="p-3 border-t bg-white dark:bg-zinc-900 sticky bottom-0 safe-area-bottom">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about check-in, wifi, parking..."
            disabled={isSending}
            className="flex-grow rounded-full border-slate-200 focus-visible:ring-indigo-600 text-sm h-11"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputMessage.trim() || isSending}
            className="h-11 w-11 rounded-full bg-indigo-600 hover:bg-indigo-700 flex-shrink-0 active:scale-95 transition-transform"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MobileChat;
