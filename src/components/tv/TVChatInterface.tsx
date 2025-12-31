import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { tvStyles } from '@/components/tv/TVLayout';
import TVFocusableButton from '@/components/tv/TVFocusableButton';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface TVChatInterfaceProps {
  propertyId?: string;
  organizationId?: string;
}

/**
 * TVChatInterface - Full-screen AI chat optimized for TV
 * 
 * Features:
 * - Large message bubbles with TV-optimized typography
 * - D-pad navigable input
 * - Uses ai-chat edge function
 * - Fetches assistant_settings for customization
 */
const TVChatInterface: React.FC<TVChatInterfaceProps> = ({ propertyId, organizationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch assistant settings
  const { data: settings } = useQuery({
    queryKey: ['assistant-settings', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data, error } = await supabase
        .from('assistant_settings')
        .select('*')
        .eq('organization_id', organizationId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!organizationId,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set initial welcome message
  useEffect(() => {
    if (settings?.tv_welcome_message || settings?.welcome_message) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: settings.tv_welcome_message || settings.welcome_message
      }]);
    }
  }, [settings]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: userMessage.content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          propertyId
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data?.reply || "I'm sorry, I couldn't process that request."
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again."
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayName = settings?.display_name || 'AI Assistant';
  const bubbleColor = settings?.bubble_color || 'hsl(var(--primary))';

  return (
    <div className="flex flex-col h-full">
      <h2 className={cn(tvStyles.heading2, "mb-6")}>Chat with {displayName}</h2>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-auto bg-card/50 rounded-2xl p-6 mb-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot className={cn(tvStyles.iconLarge, "mb-4")} />
            <p className={tvStyles.body}>Start a conversation with {displayName}</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {message.role === 'assistant' && (
              <div 
                className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: bubbleColor }}
              >
                <Bot className="h-8 w-8 text-white" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[70%] rounded-2xl p-6",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-foreground"
              )}
            >
              <p className={tvStyles.body}>{message.content}</p>
            </div>
            
            {message.role === 'user' && (
              <div className="shrink-0 w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-8 w-8 text-secondary-foreground" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div 
              className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: bubbleColor }}
            >
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="bg-muted rounded-2xl p-6">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="flex gap-4">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className={cn(
            "flex-1 h-16 md:h-20 text-xl md:text-2xl px-6 rounded-xl",
            "bg-card border-2 border-border",
            "focus:ring-4 focus:ring-primary/50"
          )}
          disabled={isLoading}
        />
        <TVFocusableButton
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className={cn(tvStyles.buttonLarge, "w-20 md:w-24")}
          style={{ backgroundColor: settings?.submit_button_color || undefined }}
        >
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Send className="h-8 w-8" />
          )}
        </TVFocusableButton>
      </div>
    </div>
  );
};

export default TVChatInterface;
