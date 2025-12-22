import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import ChatAvatar from '@/components/chat/ChatAvatar';
import { AvatarType } from '@/components/chat/avatars';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type ChatStyle = 'modern' | 'minimal' | 'playful' | 'elegant';

interface AssistantSettings {
  is_enabled: boolean;
  display_name: string;
  welcome_message: string;
  bubble_color: string;
  avatar_type: AvatarType;
  chat_style: ChatStyle;
  custom_avatar_url?: string;
  use_custom_avatar?: boolean;
  avatar_background_color?: string;
  avatar_background_color_end?: string;
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
      setSettings({
        ...data,
        avatar_type: (data.avatar_type as AvatarType) || 'concierge',
        chat_style: (data.chat_style as ChatStyle) || 'modern'
      });
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

  const avatarType = settings.avatar_type || 'concierge';
  const chatStyle = settings.chat_style || 'modern';
  const bubbleColor = settings.bubble_color;

  // Style configurations based on chat_style
  const getStyleClasses = () => {
    switch (chatStyle) {
      case 'modern':
        return {
          window: 'bg-background/95 backdrop-blur-xl border shadow-2xl',
          header: 'bg-gradient-to-r',
          bubble: 'rounded-2xl shadow-lg',
          userMessage: 'rounded-2xl rounded-br-sm',
          assistantMessage: 'rounded-2xl rounded-bl-sm bg-muted',
          inputArea: 'border-t bg-background/80 backdrop-blur',
        };
      case 'minimal':
        return {
          window: 'bg-background border-2 shadow-lg',
          header: '',
          bubble: 'rounded-full shadow-md',
          userMessage: 'rounded-xl',
          assistantMessage: 'rounded-xl bg-muted/50',
          inputArea: 'border-t-2',
        };
      case 'playful':
        return {
          window: 'bg-background border-2 shadow-2xl rounded-3xl',
          header: 'rounded-t-3xl',
          bubble: 'rounded-full shadow-xl scale-105 hover:scale-110 transition-transform',
          userMessage: 'rounded-3xl rounded-br-lg',
          assistantMessage: 'rounded-3xl rounded-bl-lg bg-muted',
          inputArea: 'border-t',
        };
      case 'elegant':
        return {
          window: 'bg-background border shadow-xl',
          header: '',
          bubble: 'rounded-xl shadow-lg',
          userMessage: 'rounded-xl rounded-br-sm',
          assistantMessage: 'rounded-xl rounded-bl-sm bg-muted/30 border',
          inputArea: 'border-t bg-muted/10',
        };
      default:
        return {
          window: 'bg-background border shadow-2xl',
          header: '',
          bubble: 'rounded-full shadow-lg',
          userMessage: 'rounded-2xl rounded-br-sm',
          assistantMessage: 'rounded-2xl rounded-bl-sm bg-muted',
          inputArea: 'border-t',
        };
    }
  };

  const styles = getStyleClasses();

  // Render markdown-style links
  const renderContent = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
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
            "fixed z-50 flex items-center justify-center text-white",
            "hover:scale-105 active:scale-95 transition-all duration-300",
            "bottom-4 right-4 sm:bottom-6 sm:right-6",
            styles.bubble,
            chatStyle === 'playful' ? 'h-16 w-16 sm:h-18 sm:w-18' : 'h-14 w-14 sm:h-16 sm:w-16'
          )}
          style={{ backgroundColor: bubbleColor }}
          aria-label="Open chat"
        >
          <ChatAvatar 
            type={avatarType} 
            size={chatStyle === 'playful' ? 44 : 40} 
            useCustomAvatar={settings.use_custom_avatar}
            customAvatarUrl={settings.custom_avatar_url}
            backgroundColorStart={settings.avatar_background_color}
            backgroundColorEnd={settings.avatar_background_color_end}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden transition-all duration-300",
            styles.window,
            // Mobile: full screen with safe area padding
            "inset-0 sm:inset-auto",
            // Desktop: positioned bottom-right
            "sm:bottom-4 sm:right-4 md:bottom-6 md:right-6",
            "sm:w-[380px] sm:max-w-[calc(100vw-2rem)]",
            chatStyle === 'playful' ? 'sm:rounded-3xl' : 'sm:rounded-2xl',
            isMinimized ? "sm:h-16" : "sm:h-[520px] sm:max-h-[calc(100vh-3rem)]"
          )}
        >
          {/* Header */}
          <div
            className={cn(
              "flex items-center justify-between px-4 py-3 text-white flex-shrink-0",
              "safe-area-top",
              styles.header
            )}
            style={{ 
              backgroundColor: bubbleColor,
              backgroundImage: chatStyle === 'modern' 
                ? `linear-gradient(135deg, ${bubbleColor}, ${bubbleColor}dd)` 
                : undefined 
            }}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center",
                chatStyle === 'playful' && "animate-bounce"
              )}>
                <ChatAvatar 
                  type={avatarType} 
                  size={36} 
                  useCustomAvatar={settings.use_custom_avatar}
                  customAvatarUrl={settings.custom_avatar_url}
                  backgroundColorStart={settings.avatar_background_color}
                  backgroundColorEnd={settings.avatar_background_color_end}
                />
              </div>
              <div>
                <span className="font-semibold">{settings.display_name}</span>
                <p className="text-xs opacity-80">Online now</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 rounded-lg p-2 transition-colors hidden sm:block"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-lg p-2 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <div className={cn(
                      "mx-auto mb-4 flex items-center justify-center",
                      chatStyle === 'playful' && "animate-bounce"
                    )}>
                      <ChatAvatar 
                        type={avatarType} 
                        size={80} 
                        useCustomAvatar={settings.use_custom_avatar}
                        customAvatarUrl={settings.custom_avatar_url}
                        backgroundColorStart={settings.avatar_background_color}
                        backgroundColorEnd={settings.avatar_background_color_end}
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{settings.display_name}</h3>
                    <p className="text-sm text-muted-foreground">{settings.welcome_message}</p>
                    
                    {/* Quick action suggestions */}
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      {['Check-in info', 'Amenities', 'Location'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setInput(suggestion);
                            inputRef.current?.focus();
                          }}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-full border transition-colors",
                            "hover:bg-muted hover:border-primary/50",
                            chatStyle === 'playful' && "rounded-full",
                            chatStyle === 'elegant' && "border-muted-foreground/30"
                          )}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex gap-2",
                          msg.role === 'user' ? 'justify-end' : 'justify-start',
                          "animate-fade-in"
                        )}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex-shrink-0">
                            <ChatAvatar 
                              type={avatarType} 
                              size={32} 
                              useCustomAvatar={settings.use_custom_avatar}
                              customAvatarUrl={settings.custom_avatar_url}
                              backgroundColorStart={settings.avatar_background_color}
                              backgroundColorEnd={settings.avatar_background_color_end}
                            />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] px-4 py-2.5 text-sm",
                            msg.role === 'user'
                              ? cn(styles.userMessage, 'text-white')
                              : styles.assistantMessage
                          )}
                          style={msg.role === 'user' ? { backgroundColor: bubbleColor } : undefined}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">
                            {renderContent(msg.content)}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium">You</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2 animate-fade-in">
                        <div className="flex-shrink-0">
                          <ChatAvatar 
                            type={avatarType} 
                            size={32} 
                            className="animate-pulse"
                            useCustomAvatar={settings.use_custom_avatar}
                            customAvatarUrl={settings.custom_avatar_url}
                            backgroundColorStart={settings.avatar_background_color}
                            backgroundColorEnd={settings.avatar_background_color_end}
                          />
                        </div>
                        <div className={cn(styles.assistantMessage, "px-4 py-3")}>
                          <div className="flex gap-1.5">
                            <span 
                              className="h-2 w-2 rounded-full animate-bounce" 
                              style={{ backgroundColor: bubbleColor, opacity: 0.7 }} 
                            />
                            <span 
                              className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.15s]" 
                              style={{ backgroundColor: bubbleColor, opacity: 0.7 }} 
                            />
                            <span 
                              className="h-2 w-2 rounded-full animate-bounce [animation-delay:0.3s]" 
                              style={{ backgroundColor: bubbleColor, opacity: 0.7 }} 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className={cn("p-3 flex-shrink-0", styles.inputArea, "safe-area-bottom")}>
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className={cn(
                      "flex-1 min-h-[44px] max-h-[100px] resize-none border border-input",
                      "bg-background px-4 py-2.5 text-sm ring-offset-background",
                      "placeholder:text-muted-foreground focus-visible:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      chatStyle === 'playful' ? 'rounded-2xl' : 'rounded-xl'
                    )}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className={cn(
                      "h-11 w-11 flex-shrink-0 transition-transform hover:scale-105",
                      chatStyle === 'playful' ? 'rounded-2xl' : 'rounded-xl'
                    )}
                    style={{ backgroundColor: bubbleColor }}
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
