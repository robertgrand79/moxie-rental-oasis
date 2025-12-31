import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, MessageSquare, Home, Megaphone, ClipboardList, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ChatAvatar from '@/components/chat/ChatAvatar';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { AvatarType, avatarInfo } from '@/components/chat/avatars';
import { cn } from '@/lib/utils';

// Fun, personality-driven welcome messages for each avatar
const getPersonalizedWelcome = (avatarType: AvatarType): string => {
  const avatarName = avatarInfo[avatarType]?.name || 'Assistant';
  
  const greetings: Partial<Record<AvatarType, string>> = {
    'captain-moxie': `Hey there! I'm ${avatarName} - your heroic guide! 🦸 What can I help you with today?`,
    'pop-art-moxie': `WOW! Hey! I'm ${avatarName}! Ready to make things POP? 💥`,
    'action-moxie': `Yo! ${avatarName} here, ready for action! How can I help? 🚀`,
    'retro-comic-host': `Golly gee! I'm ${avatarName}, at your service! How may I assist?`,
    'moxie-mascot': `Hey hey! ${avatarName} here, your #1 assistant! What do you need?`,
    'moxie-fox': `Hey there! I'm ${avatarName} - your clever assistant! 🦊`,
    'hoot-owl': `Hoo-hoo! I'm ${avatarName}, your wise guide. 🦉`,
    'genie-mo': `Your wish is my command! ✨ I'm ${avatarName}!`,
    'blobby': `Bloop bloop! I'm ${avatarName}! 🫧 Super excited to help!`,
    'robo-host': `Greetings! I'm ${avatarName}, at your service. 🤖`,
  };
  
  return greetings[avatarType] || `Hi! I'm ${avatarName}, ready to help you today!`;
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickPrompt {
  title: string;
  prompt: string;
}

interface PromptCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  prompts: QuickPrompt[];
}

type ChatStyle = 'modern' | 'minimal' | 'playful' | 'elegant';

const quickPromptCategories: PromptCategory[] = [
  {
    id: 'guest',
    name: 'Guest',
    icon: MessageSquare,
    prompts: [
      { title: 'Welcome Message', prompt: 'Write a warm, friendly welcome message for guests checking into a vacation rental. Include check-in time (4 PM), WiFi info placeholder, and local tips.' },
      { title: 'Check-out Instructions', prompt: 'Write clear and friendly check-out instructions for guests. Include 11 AM checkout time, key return process, and thank you message.' },
      { title: 'Late Check-out Response', prompt: 'Draft a polite response to a guest requesting late check-out. Be helpful but explain availability depends on next booking.' },
      { title: 'Review Response', prompt: 'Write a professional thank you response to a positive guest review. Keep it warm and personal.' },
    ]
  },
  {
    id: 'property',
    name: 'Property',
    icon: Home,
    prompts: [
      { title: 'Property Description', prompt: 'Write a compelling vacation rental property description. Highlight comfort, location, and unique features. Make it inviting and descriptive.' },
      { title: 'Amenity Highlights', prompt: 'Create an engaging amenities section for a vacation rental listing. Organize by category (kitchen, entertainment, outdoor, etc.).' },
      { title: 'Neighborhood Guide', prompt: 'Write a neighborhood guide for vacation rental guests. Include nearby restaurants, attractions, and local tips.' },
      { title: 'House Rules', prompt: 'Write clear but friendly house rules for a vacation rental. Cover noise, pets, smoking, and guest policies.' },
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Megaphone,
    prompts: [
      { title: 'Holiday Promotion', prompt: 'Write promotional copy for a holiday special offer on vacation rentals. Create urgency while staying professional.' },
      { title: 'Last-Minute Deal', prompt: 'Create marketing copy for a last-minute booking discount. Emphasize the value and limited availability.' },
      { title: 'New Amenity Announcement', prompt: 'Draft an announcement for new amenities added to a vacation rental. Make it exciting and highlight guest benefits.' },
      { title: 'Email Newsletter', prompt: 'Write engaging newsletter content for vacation rental subscribers. Include seasonal highlights and booking reminders.' },
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: ClipboardList,
    prompts: [
      { title: 'Cleaning Checklist', prompt: 'Generate a detailed cleaning checklist for vacation rental turnover. Cover all rooms and include often-missed items.' },
      { title: 'Maintenance Report', prompt: 'Create a template for maintenance inspection notes. Include categories for HVAC, plumbing, appliances, and exterior.' },
      { title: 'Contractor Instructions', prompt: 'Write clear work order instructions for a contractor. Include access info, scope of work, and completion requirements.' },
      { title: 'Inventory List', prompt: 'Create a comprehensive inventory checklist for a vacation rental. Include kitchen, linens, and amenity supplies.' },
    ]
  },
];

// Style configurations based on chat_style
const getStyleClasses = (style: ChatStyle) => {
  switch (style) {
    case 'modern':
      return {
        container: 'bg-background/95 backdrop-blur-xl border shadow-2xl rounded-2xl',
        header: 'rounded-t-2xl',
        userMessage: 'rounded-2xl rounded-br-sm',
        assistantMessage: 'rounded-2xl rounded-bl-sm bg-muted',
        input: 'rounded-xl',
      };
    case 'minimal':
      return {
        container: 'bg-background border-2 shadow-lg rounded-xl',
        header: 'rounded-t-xl',
        userMessage: 'rounded-xl',
        assistantMessage: 'rounded-xl bg-muted/50',
        input: 'rounded-lg',
      };
    case 'playful':
      return {
        container: 'bg-background border-2 shadow-2xl rounded-3xl',
        header: 'rounded-t-3xl',
        userMessage: 'rounded-3xl rounded-br-lg',
        assistantMessage: 'rounded-3xl rounded-bl-lg bg-muted',
        input: 'rounded-2xl',
      };
    case 'elegant':
      return {
        container: 'bg-background border shadow-xl rounded-xl',
        header: 'rounded-t-xl',
        userMessage: 'rounded-xl rounded-br-sm',
        assistantMessage: 'rounded-xl rounded-bl-sm bg-muted/30 border',
        input: 'rounded-lg',
      };
    default:
      return {
        container: 'bg-background border shadow-2xl rounded-2xl',
        header: 'rounded-t-2xl',
        userMessage: 'rounded-2xl rounded-br-sm',
        assistantMessage: 'rounded-2xl rounded-bl-sm bg-muted',
        input: 'rounded-xl',
      };
  }
};

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

const MAX_MESSAGE_LENGTH = 2000;

const GeneralChatTab = () => {
  const { organization } = useCurrentOrganization();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarType, setAvatarType] = useState<AvatarType>('captain-moxie');
  const [displayName, setDisplayName] = useState('Stay Moxie Assistant');
  const [bubbleColor, setBubbleColor] = useState('#3B82F6');
  const [submitButtonColor, setSubmitButtonColor] = useState<string | null>(null);
  const [chatStyle, setChatStyle] = useState<ChatStyle>('modern');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch assistant settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!organization?.id) return;
      
      const { data } = await supabase
        .from('assistant_settings')
        .select('avatar_type, display_name, bubble_color, submit_button_color, chat_style')
        .eq('organization_id', organization.id)
        .maybeSingle();
      
      if (data) {
        setAvatarType((data.avatar_type as AvatarType) || 'captain-moxie');
        setDisplayName(data.display_name || 'AI Assistant');
        setBubbleColor(data.bubble_color || '#3B82F6');
        setSubmitButtonColor(data.submit_button_color || null);
        setChatStyle((data.chat_style as ChatStyle) || 'modern');
      }
    };
    fetchSettings();

    // Subscribe to real-time changes for instant preview updates
    const channel = supabase
      .channel('assistant-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assistant_settings',
          filter: `organization_id=eq.${organization?.id}`
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as Record<string, unknown>;
            setAvatarType((newData.avatar_type as AvatarType) || 'captain-moxie');
            setDisplayName((newData.display_name as string) || 'AI Assistant');
            setBubbleColor((newData.bubble_color as string) || '#3B82F6');
            setSubmitButtonColor((newData.submit_button_color as string) || null);
            setChatStyle((newData.chat_style as ChatStyle) || 'modern');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const trimmedMessage = input.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: 'Message too long',
        description: `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
        variant: 'destructive'
      });
      return;
    }

    const userMessage: Message = { role: 'user', content: trimmedMessage };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setActiveCategory(null);
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
    } catch (error: unknown) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      toast({
        title: 'Error',
        description: errorMessage,
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

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    setInput(prompt.prompt);
    setActiveCategory(null);
  };

  const toggleCategory = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const styles = getStyleClasses(chatStyle);
  const avatarName = avatarInfo[avatarType]?.name || displayName;
  const personalizedWelcome = getPersonalizedWelcome(avatarType);
  const showCharCounter = input.length > MAX_MESSAGE_LENGTH * 0.8;

  // Quick action suggestions for empty state
  const quickSuggestions = ['Draft emails', 'Guest responses', 'Content ideas', 'Property descriptions'];

  return (
    <div className={cn("flex flex-col h-[600px] overflow-hidden", styles.container)}>
      {/* Header with gradient */}
      <div 
        className={cn("flex items-center justify-between px-5 py-4", styles.header)}
        style={{ 
          background: `linear-gradient(135deg, ${bubbleColor}dd, ${bubbleColor}99)` 
        }}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "transition-transform duration-300",
            chatStyle === 'playful' && "animate-bounce"
          )}>
            <ChatAvatar type={avatarType} size={44} />
          </div>
          <div className="text-white">
            <span className="font-semibold text-lg">{avatarName}</span>
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Online now
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearChat} 
            className="text-white/80 hover:text-white hover:bg-white/20"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      {/* Accent line */}
      <div 
        className="h-1 w-full" 
        style={{ 
          background: `linear-gradient(to right, ${bubbleColor}, ${bubbleColor}80)` 
        }} 
      />

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-8 px-4 animate-fade-in">
            <div className={cn(
              "mx-auto mb-4 transition-transform duration-500",
              chatStyle === 'playful' && "hover:scale-110"
            )}>
              <ChatAvatar type={avatarType} size={80} />
            </div>
            <p className="text-xl font-semibold mb-2" style={{ color: bubbleColor }}>
              {avatarName}
            </p>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {personalizedWelcome}
            </p>
            
            {/* Quick suggestion pills */}
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {quickSuggestions.map((item) => (
                <button 
                  key={item} 
                  onClick={() => setInput(`Help me with ${item.toLowerCase()}`)}
                  className={cn(
                    "text-sm px-4 py-2 border transition-all duration-200",
                    "hover:scale-105 hover:shadow-md cursor-pointer",
                    chatStyle === 'playful' ? 'rounded-full' : 'rounded-lg'
                  )}
                  style={{ 
                    backgroundColor: `${bubbleColor}15`, 
                    borderColor: `${bubbleColor}40`, 
                    color: bubbleColor 
                  }}
                >
                  <Sparkles className="h-3 w-3 inline mr-1.5 opacity-70" />
                  {item}
                </button>
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
                  className={cn(
                    "max-w-[80%] px-4 py-2.5 shadow-sm",
                    msg.role === 'user'
                      ? cn(styles.userMessage, 'text-white')
                      : styles.assistantMessage
                  )}
                  style={msg.role === 'user' ? { backgroundColor: bubbleColor } : undefined}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
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
              <div className="flex gap-3 animate-fade-in">
                <ChatAvatar type={avatarType} size={32} />
                <div className={cn("px-4 py-3 shadow-sm", styles.assistantMessage)}>
                  <div className="flex gap-1.5">
                    <span 
                      className="h-2.5 w-2.5 rounded-full animate-bounce" 
                      style={{ backgroundColor: bubbleColor }}
                    />
                    <span 
                      className="h-2.5 w-2.5 rounded-full animate-bounce [animation-delay:0.15s]" 
                      style={{ backgroundColor: bubbleColor }}
                    />
                    <span 
                      className="h-2.5 w-2.5 rounded-full animate-bounce [animation-delay:0.3s]" 
                      style={{ backgroundColor: bubbleColor }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-background/80 backdrop-blur">
        {/* Quick Prompt Categories */}
        <div className="px-4 pt-3 pb-2">
          {/* Style Selector */}
          <div className="flex gap-1.5 mb-3">
            {(['modern', 'minimal', 'playful', 'elegant'] as ChatStyle[]).map(style => (
              <button
                key={style}
                onClick={() => setChatStyle(style)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full transition-all duration-200 capitalize",
                  chatStyle === style 
                    ? "text-white shadow-sm" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                style={chatStyle === style ? { backgroundColor: bubbleColor } : undefined}
              >
                {style}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {quickPromptCategories.map(category => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "text-xs h-7 transition-all duration-200",
                    activeCategory === category.id && "shadow-sm"
                  )}
                  style={activeCategory === category.id ? { backgroundColor: bubbleColor } : undefined}
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {category.name}
                </Button>
              );
            })}
          </div>
          
          {/* Active Category Prompts */}
          {activeCategory && (
            <div className="mt-2 flex gap-2 flex-wrap animate-fade-in">
              {quickPromptCategories
                .find(c => c.id === activeCategory)
                ?.prompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt)}
                    className={cn(
                      "text-xs px-2.5 py-1.5 bg-background border hover:shadow-sm transition-all duration-200",
                      chatStyle === 'playful' ? 'rounded-full' : 'rounded-md'
                    )}
                    style={{ borderColor: `${bubbleColor}40` }}
                  >
                    {prompt.title}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message or select a quick prompt above..."
              className={cn("resize-none min-h-[44px] max-h-32 pr-14", styles.input)}
              rows={1}
            />
            {showCharCounter && (
              <span className={cn(
                "absolute left-3 bottom-1 text-[10px]",
                input.length > MAX_MESSAGE_LENGTH ? "text-destructive" : "text-muted-foreground"
              )}>
                {input.length}/{MAX_MESSAGE_LENGTH}
              </span>
            )}
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading || input.length > MAX_MESSAGE_LENGTH}
              className={cn(
                "absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 transition-transform duration-200",
                "hover:scale-105",
                chatStyle === 'playful' ? 'rounded-full' : 'rounded-lg'
              )}
              size="icon"
              style={{ backgroundColor: submitButtonColor || bubbleColor }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralChatTab;
