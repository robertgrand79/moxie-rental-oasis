import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useTenant } from '@/contexts/TenantContext';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import ChatAvatar from '@/components/chat/ChatAvatar';
import { AvatarType, avatarInfo } from '@/components/chat/avatars';

// Fun, personality-driven welcome messages for each avatar
const getPersonalizedWelcome = (avatarType: AvatarType, customWelcome?: string): string => {
  if (customWelcome && customWelcome.trim()) return customWelcome;
  
  const avatarName = avatarInfo[avatarType]?.name || 'Assistant';
  
  const greetings: Partial<Record<AvatarType, string>> = {
    'captain-moxie': `Hey there, traveler! I'm ${avatarName} - your heroic guide to an amazing stay! What can I help you with?`,
    'pop-art-moxie': `WOW! Hey! I'm ${avatarName}! Ready to make your stay POP? What's on your mind?`,
    'action-moxie': `Yo! I'm ${avatarName}, ready for action! How can I help make your stay legendary?`,
    'retro-comic-host': `Golly gee! I'm ${avatarName}, at your service! How may I assist you today, friend?`,
    'moxie-mascot': `Hey hey! ${avatarName} here, your #1 travel buddy! What can I help you with?`,
    'ink-style-moxie': `*sketches a wave* Hey! I'm ${avatarName}. What's your story? How can I help?`,
    'berry-mascot': `Hiii! I'm ${avatarName}! So excited to help you! What do you need?`,
    'blaze-mascot': `What's up! ${avatarName} here, fired up to help you! What can I do?`,
    'cool-mascot': `Hey there~ I'm ${avatarName}. Chill vibes only! How can I help you out?`,
    'mint-mascot': `🎧 Yo! ${avatarName} here, ready to tune into your needs! What's up?`,
    'rose-mascot': `Hello lovely! I'm ${avatarName}. How can I brighten your stay today?`,
    'spark-mascot': `⚡ ZAP! I'm ${avatarName}! Electrified to help! What do you need?`,
    'sunny-mascot': `Hey sunshine! I'm ${avatarName}! Ready to make your day brighter! What's up?`,
    'moxie-fox': `Hey there! I'm ${avatarName} - your clever travel buddy! 🦊 How can I make your stay amazing?`,
    'hoot-owl': `Hoo-hoo! I'm ${avatarName}, your wise guide. 🦉 What would you like to know about your stay?`,
    'casita-house': `Welcome home! I'm ${avatarName}, and I'm so happy you're here! 🏠 How can I help you settle in?`,
    'genie-mo': `Your wish is my command! ✨ I'm ${avatarName} - ready to make your stay magical!`,
    'blobby': `Bloop bloop! I'm ${avatarName}! 🫧 Super excited to help you with your stay!`,
    'paw-dog': `Woof woof! I'm ${avatarName}, your loyal travel buddy! 🐕 What can I help you sniff out?`,
    'robo-host': `Greetings, traveler! I'm ${avatarName}, at your service. 🤖 How may I assist with your stay?`,
    'tropico-drink': `Aloha! I'm ${avatarName} - bringing those vacation vibes! 🍹 How can I help you relax?`,
    // Big Ten mascots
    'brutus-buckeye': `O-H-I-O! I'm ${avatarName}, ready to help you score an amazing stay! 🏈`,
    'sparty': `THIS IS SPARTA... I mean, your vacation! I'm ${avatarName}, at your service! 💪`,
    'herky-hawk': `Go Hawks! I'm ${avatarName}, ready to swoop in and help with your stay! 🦅`,
    'bucky-badger': `On, Wisconsin! I'm ${avatarName}, here to make your stay great! 🦡`,
    'goldy-gopher': `Ski-U-Mah! I'm ${avatarName}, ready to dig into your questions! 🐿️`,
    'nittany-lion': `We Are... here to help! I'm ${avatarName}, your Penn State guide! 🦁`,
    'purdue-pete': `Boiler Up! I'm ${avatarName}, engineering the perfect stay for you! 🔧`,
    'wolverine': `Go Blue! I'm ${avatarName}, fierce about helping you! 💛💙`,
    'herbie-husker': `Go Big Red! I'm ${avatarName}, ready to help with your cornhusker stay! 🌽`,
    'willie-wildcat': `Go 'Cats! I'm ${avatarName}, purr-fectly ready to assist! 🐱`,
    'testudo': `Fear the Turtle! I'm ${avatarName}, slowly and surely helping you! 🐢`,
    'scarlet-knight': `Rutgers pride! I'm ${avatarName}, ready to champion your stay! ⚔️`,
    'oregon-duck': `Sco Ducks! I'm ${avatarName}, ready to waddle into action for you! 🦆`,
    'joe-bruin': `Go Bruins! I'm ${avatarName}, bear-y excited to help! 🐻`,
    'tommy-trojan': `Fight On! I'm ${avatarName}, ready to conquer your stay questions! ⚔️`,
    'harry-husky': `Go Huskies! I'm ${avatarName}, howling to help you! 🐺`,
    'illini': `I-L-L-I-N-I! I'm your Fighting Illini guide, ready to help! 🔶`,
    'hoosiers': `Go Hoosiers! I'm here to help with your Indiana stay! 🔴`,
  };
  
  return greetings[avatarType] || `Hi! I'm ${avatarName}, here to help you with your stay!`;
};

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
  text_color?: string;
  submit_button_color?: string;
  user_message_text_color?: string;
  assistant_message_bg_color?: string;
  header_text_color?: string;
  welcome_title_color?: string;
  welcome_subtitle_color?: string;
  quick_action_text_color?: string;
}

// Generate unique session ID
const generateSessionId = () => {
  const stored = sessionStorage.getItem('chat_session_id');
  if (stored) return stored;
  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('chat_session_id', newId);
  return newId;
};

// Persist conversation to localStorage
const CONVERSATION_STORAGE_KEY = 'chat_conversation_history';
const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_DELAY = 1000; // 1 second between messages

const saveConversation = (messages: Message[], tenantId: string) => {
  try {
    const key = `${CONVERSATION_STORAGE_KEY}_${tenantId}`;
    localStorage.setItem(key, JSON.stringify({
      messages,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to save conversation:', e);
  }
};

const loadConversation = (tenantId: string): Message[] => {
  try {
    const key = `${CONVERSATION_STORAGE_KEY}_${tenantId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const data = JSON.parse(stored);
    // Only restore if less than 24 hours old
    if (Date.now() - data.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return [];
    }
    return data.messages || [];
  } catch (e) {
    return [];
  }
};

const clearConversation = (tenantId: string) => {
  try {
    const key = `${CONVERSATION_STORAGE_KEY}_${tenantId}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('Failed to clear conversation:', e);
  }
};

const PublicChatWidget = () => {
  const location = useLocation();
  const { tenant } = useTenant();
  
  // Don't render on admin routes or platform marketing pages
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/platform')) {
    return null;
  }
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [sessionId] = useState(generateSessionId);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const escalationChannelRef = useRef<RealtimeChannel | null>(null);

  // Load conversation from localStorage on mount
  useEffect(() => {
    if (tenant?.id) {
      const savedMessages = loadConversation(tenant.id);
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      }
    }
  }, [tenant?.id]);

  // Save conversation when messages change
  useEffect(() => {
    if (tenant?.id && messages.length > 0) {
      saveConversation(messages, tenant.id);
    }
  }, [messages, tenant?.id]);

  useEffect(() => {
    if (tenant?.id) {
      fetchSettings();
    }
  }, [tenant?.id]);

  // Subscribe to escalation responses for this session
  useEffect(() => {
    if (!tenant?.id || !sessionId) return;

    // Clean up any previous channel first (prevents "subscribe multiple times" race)
    if (escalationChannelRef.current) {
      try {
        supabase.removeChannel(escalationChannelRef.current);
      } catch {
        // ignore
      }
      escalationChannelRef.current = null;
    }

    const channelName = `escalation-responses-${sessionId}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'assistant_escalations',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const escalation = payload.new as { status?: string; host_response?: string };
          // Only inject message if status changed to answered and has response
          if (escalation.status === 'answered' && escalation.host_response) {
            const hostMessage: Message = {
              role: 'assistant',
              content: `📩 **Response from our team:**\n\n${escalation.host_response}\n\n---\n*This is a direct response from our host regarding your question.*`
            };
            setMessages(prev => {
              // Avoid duplicates by checking if we already have this response
              const alreadyHasResponse = prev.some(m =>
                m.role === 'assistant' && m.content.includes(escalation.host_response as string)
              );
              if (alreadyHasResponse) return prev;
              return [...prev, hostMessage];
            });
          }
        }
      )
      .subscribe();

    escalationChannelRef.current = channel;

    return () => {
      if (escalationChannelRef.current) {
        try {
          supabase.removeChannel(escalationChannelRef.current);
        } catch {
          // ignore
        }
        escalationChannelRef.current = null;
      }
    };
  }, [tenant?.id, sessionId]);

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
        avatar_type: (data.avatar_type as AvatarType) || 'captain-moxie',
        chat_style: (data.chat_style as ChatStyle) || 'modern'
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Rate limiting - prevent rapid-fire messages
    const now = Date.now();
    if (now - lastMessageTime < RATE_LIMIT_DELAY) {
      return;
    }
    setLastMessageTime(now);

    // Message length validation
    const trimmedMessage = input.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Your message is too long (${trimmedMessage.length} characters). Please keep it under ${MAX_MESSAGE_LENGTH} characters.`
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = { role: 'user', content: trimmedMessage };
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
    } catch (error: unknown) {
      console.error('Chat error:', error);
      let errorContent = 'Sorry, I encountered an error. Please try again later.';
      
      const errMsg = error instanceof Error ? error.message : '';
      if (errMsg.includes('429')) {
        errorContent = 'I\'m receiving too many requests. Please wait a moment and try again.';
      } else if (errMsg.includes('402')) {
        errorContent = 'The chat service is temporarily unavailable. Please try again later or contact us directly.';
      }
      
      const errResponse: Message = {
        role: 'assistant',
        content: errorContent
      };
      setMessages(prev => [...prev, errResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (tenant?.id) {
      clearConversation(tenant.id);
    }
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Limit input length client-side
    const value = e.target.value.slice(0, MAX_MESSAGE_LENGTH + 100);
    setInput(value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  if (!settings?.is_enabled) return null;

  const avatarType: AvatarType = (settings.avatar_type as AvatarType) || 'captain-moxie';
  const chatStyle = settings.chat_style || 'modern';
  const bubbleColor = settings.bubble_color;
  const submitButtonColor = settings.submit_button_color || bubbleColor;
  const textColor = settings.text_color || '#1F2937';
  const userMessageTextColor = settings.user_message_text_color || '#FFFFFF';
  const headerTextColor = settings.header_text_color || '#FFFFFF';
  const welcomeTitleColor = settings.welcome_title_color || bubbleColor;
  const welcomeSubtitleColor = settings.welcome_subtitle_color || undefined;
  const quickActionTextColor = settings.quick_action_text_color || bubbleColor;

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
              <div style={{ color: headerTextColor }}>
                <span className="font-semibold">{settings.display_name || avatarInfo[avatarType]?.name || 'Assistant'}</span>
                <p className="text-xs opacity-80">Online now</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="hover:bg-white/20 rounded-lg p-2 transition-colors"
                  aria-label="Clear chat history"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
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
                    <h3 className="font-semibold text-lg mb-2" style={{ color: welcomeTitleColor }}>{settings.display_name || avatarInfo[avatarType]?.name || 'Assistant'}</h3>
                    <p className={cn("text-sm", !welcomeSubtitleColor && "text-muted-foreground")} style={welcomeSubtitleColor ? { color: welcomeSubtitleColor } : undefined}>{getPersonalizedWelcome(avatarType, settings.welcome_message)}</p>
                    
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
                            "hover:opacity-80",
                            chatStyle === 'playful' && "rounded-full",
                            chatStyle === 'elegant' && "border-transparent"
                          )}
                          style={{ 
                            backgroundColor: quickActionTextColor,
                            color: '#FFFFFF',
                            borderColor: quickActionTextColor
                          }}
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
                              ? cn(styles.userMessage)
                              : styles.assistantMessage
                          )}
                          style={msg.role === 'user' 
                            ? { backgroundColor: bubbleColor, color: userMessageTextColor } 
                            : { color: textColor }
                          }
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
                {/* Character counter when approaching limit */}
                {input.length > MAX_MESSAGE_LENGTH * 0.8 && (
                  <div className={cn(
                    "text-xs mb-1 text-right",
                    input.length > MAX_MESSAGE_LENGTH ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {input.length}/{MAX_MESSAGE_LENGTH}
                  </div>
                )}
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
                      chatStyle === 'playful' ? 'rounded-2xl' : 'rounded-xl',
                      input.length > MAX_MESSAGE_LENGTH && "border-destructive"
                    )}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading || input.length > MAX_MESSAGE_LENGTH}
                    size="icon"
                    className={cn(
                      "h-11 w-11 flex-shrink-0 transition-transform hover:scale-105",
                      chatStyle === 'playful' ? 'rounded-2xl' : 'rounded-xl'
                    )}
                    style={{ backgroundColor: submitButtonColor }}
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
