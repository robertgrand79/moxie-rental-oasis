import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { debug } from '@/utils/debug';

export interface ChatSession {
  id: string;
  guest_name: string;
  email?: string;
  status: 'active' | 'pending' | 'resolved';
  last_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  content: string;
  sender: 'guest' | 'admin' | 'ai';
  created_at: string;
}

export const useChatSessions = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();

  const fetchChatSessions = async () => {
    if (!organization?.id) {
      setChatSessions([]);
      setLoading(false);
      return;
    }

    debug.log('[Chat]', 'Fetching chat sessions...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('organization_id', organization.id)
        .order('updated_at', { ascending: false });

      if (error) {
        debug.error('[Chat]', 'Error fetching chat sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch chat sessions.',
          variant: 'destructive'
        });
        setChatSessions([]);
      } else {
        debug.log('[Chat]', 'Fetched chat sessions:', data);
        // Type assertion to ensure proper typing
        const typedSessions = (data || []).map(session => ({
          ...session,
          status: session.status as 'active' | 'pending' | 'resolved'
        }));
        setChatSessions(typedSessions);
      }
    } catch (error) {
      console.error('Error in fetchChatSessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch chat sessions.',
        variant: 'destructive'
      });
      setChatSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (sessionId: string): Promise<ChatMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch messages.',
          variant: 'destructive'
        });
        return [];
      }

      // Type assertion for messages
      return (data || []).map(message => ({
        ...message,
        sender: message.sender as 'guest' | 'admin' | 'ai'
      }));
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      return [];
    }
  };

  const sendMessage = async (sessionId: string, content: string): Promise<ChatMessage | null> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to send messages.',
        variant: 'destructive'
      });
      return null;
    }

    if (!organization?.id) {
      toast({
        title: 'Error',
        description: 'Organization context is required.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          content,
          sender: 'admin',
          organization_id: organization.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message.',
          variant: 'destructive'
        });
        return null;
      }

      // Update session's last message
      await supabase
        .from('chat_sessions')
        .update({ last_message: content })
        .eq('id', sessionId)
        .eq('organization_id', organization.id);

      // Type assertion for the returned message
      return {
        ...data,
        sender: data.sender as 'guest' | 'admin' | 'ai'
      };
    } catch (error) {
      console.error('Error in sendMessage:', error);
      return null;
    }
  };

  const updateSessionStatus = async (sessionId: string, status: 'active' | 'pending' | 'resolved'): Promise<boolean> => {
    if (!organization?.id) return false;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ status })
        .eq('id', sessionId)
        .eq('organization_id', organization.id);

      if (error) {
        console.error('Error updating session status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update session status.',
          variant: 'destructive'
        });
        return false;
      }

      // Update local state
      setChatSessions(prev => prev.map(session => 
        session.id === sessionId ? { ...session, status } : session
      ));

      toast({
        title: 'Success',
        description: `Session marked as ${status}.`
      });

      return true;
    } catch (error) {
      console.error('Error in updateSessionStatus:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchChatSessions();
  }, [organization?.id]);

  return {
    chatSessions,
    loading,
    fetchMessages,
    sendMessage,
    updateSessionStatus,
    refetch: fetchChatSessions
  };
};
