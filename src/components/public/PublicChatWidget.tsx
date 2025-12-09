import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantSettings {
  is_enabled: boolean;
  display_name: string;
  welcome_message: string;
  bubble_color: string;
}

// Generate unique session ID
const generateSessionId = () => {
  const stored = sessionStorage.getItem('chat_session_id');
  if (stored) return stored;
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('chat_session_id', newId);
  return newId;
};

const PublicChatWidget = () => {
  const location = useLocation();
  const { tenant } = useTenant();
  
  // Don't render on admin routes - admins have dedicated Stay Moxie Assistant
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [sessionId] = useState(generateSessionId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (tenant?.id) {
      fetchSettings();
    }
  }, [tenant?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const fetchSettings = async () => {
    if (!tenant?.id) return;

    const { data, error } = await supabase
      .from('assistant_settings')
      .select('*')
      .eq('organization_id', tenant.id)
      .eq('is_enabled', true)
      .maybeSingle();

    if (!error && data) {
      setSettings(data);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('public-ai-chat', {
        body: {
          message: userMessage.content,
          conversationHistory: messages,
          organizationId: tenant?.id,
          sessionId
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
      const errorMessage: Message = {
        role: 'assistant',
        content: error.message?.includes('429') 
          ? 'I\'m receiving too many requests. Please wait a moment and try again.'
          : 'Sorry, I encountered an error. Please try again later.'
      };
      setMessages(prev => [...prev, errorMessage]);
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

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  if (!settings?.is_enabled) return null;

  const bubbleStyle = { backgroundColor: settings.bubble_color };

  // Render markdown-style links
  const renderContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:no-underline"
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed z-50 rounded-full shadow-lg flex items-center justify-center text-white",
            "hover:scale-105 active:scale-95 transition-all duration-200",
            "h-12 w-12 sm:h-14 sm:w-14",
            "bottom-4 right-4 sm:bottom-6 sm:right-6"
          )}
          style={bubbleStyle}
          aria-label="Open chat"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "fixed z-50 bg-background border shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
            // Mobile: full screen with safe area padding
            "inset-0 sm:inset-auto",
            // Desktop: positioned bottom-right
            "sm:bottom-4 sm:right-4 md:bottom-6 md:right-6",
            "sm:w-[360px] sm:max-w-[calc(100vw-2rem)]",
            "sm:rounded-xl",
            isMinimized ? "sm:h-14" : "sm:h-[500px] sm:max-h-[calc(100vh-3rem)]"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3 text-white flex-shrink-0",
              "safe-area-top"
            )}
            style={bubbleStyle}
          >
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-medium">{settings.display_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 rounded p-1.5 transition-colors hidden sm:block"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded p-1.5 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 px-4">
                    <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">{settings.welcome_message}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex gap-2",
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {msg.role === 'assistant' && (
                          <div
                            className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                            style={bubbleStyle}
                          >
                            <Bot className="h-4 w-4" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                            msg.role === 'user'
                              ? 'text-white rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          )}
                          style={msg.role === 'user' ? bubbleStyle : undefined}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {renderContent(msg.content)}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2">
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-white"
                          style={bubbleStyle}
                        >
                          <Bot className="h-4 w-4 animate-pulse" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <span className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className={cn("p-3 border-t flex-shrink-0", "safe-area-bottom")}>
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className={cn(
                      "flex-1 min-h-[40px] max-h-[100px] resize-none rounded-xl border border-input",
                      "bg-background px-3 py-2 text-sm ring-offset-background",
                      "placeholder:text-muted-foreground focus-visible:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-10 w-10 rounded-xl flex-shrink-0"
                    style={bubbleStyle}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PublicChatWidget;
