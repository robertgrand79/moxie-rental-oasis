import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ChatAvatar from '@/components/chat/ChatAvatar';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { AvatarType } from '@/components/chat/avatars';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const GeneralChatTab = () => {
  const { organization } = useCurrentOrganization();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarType, setAvatarType] = useState<AvatarType>('advisor');
  const [displayName, setDisplayName] = useState('AI Assistant');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch assistant settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!organization?.id) return;
      
      const { data } = await supabase
        .from('assistant_settings')
        .select('avatar_type, display_name')
        .eq('organization_id', organization.id)
        .maybeSingle();
      
      if (data) {
        setAvatarType((data.avatar_type as AvatarType) || 'advisor');
        setDisplayName(data.display_name || 'AI Assistant');
      }
    };
    fetchSettings();
  }, [organization?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage.content,
          conversationHistory: messages
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.aiResponse || 'Sorry, I could not generate a response.'
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI response',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-2xl bg-card overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <ChatAvatar type={avatarType} size={40} />
          <div>
            <span className="font-semibold">{displayName}</span>
            <p className="text-xs text-muted-foreground">Ready to help</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 px-4">
            <ChatAvatar type={avatarType} size={80} className="mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Hi! I'm your {displayName}.</p>
            <p className="text-sm mb-4">I can help you with:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Draft emails', 'Guest responses', 'Content ideas', 'Property descriptions'].map((item) => (
                <span key={item} className="text-xs px-3 py-1.5 rounded-full bg-muted border">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {msg.role === 'assistant' && (
                  <ChatAvatar type={avatarType} size={32} />
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">You</span>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <ChatAvatar type={avatarType} size={32} className="animate-pulse" />
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="h-2 w-2 bg-primary/50 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="resize-none min-h-[44px] max-h-32 rounded-xl"
            rows={1}
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            className="rounded-xl h-11 w-11"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralChatTab;
