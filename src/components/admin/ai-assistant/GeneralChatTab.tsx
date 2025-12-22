import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, MessageSquare, Home, Megaphone, ClipboardList } from 'lucide-react';
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

const GeneralChatTab = () => {
  const { organization } = useCurrentOrganization();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarType, setAvatarType] = useState<AvatarType>('captain-moxie');
  const [displayName, setDisplayName] = useState('Stay Moxie Assistant');
  const [bubbleColor, setBubbleColor] = useState('#3B82F6');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch assistant settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!organization?.id) return;
      
      const { data } = await supabase
        .from('assistant_settings')
        .select('avatar_type, display_name, bubble_color')
        .eq('organization_id', organization.id)
        .maybeSingle();
      
      if (data) {
        setAvatarType((data.avatar_type as AvatarType) || 'captain-moxie');
        setDisplayName(data.display_name || 'AI Assistant');
        setBubbleColor(data.bubble_color || '#3B82F6');
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

    const userMessage: Message = { role: 'user', content: input.trim() };
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

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    setInput(prompt.prompt);
    setActiveCategory(null);
  };

  const toggleCategory = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-2xl bg-card overflow-hidden shadow-lg">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ background: `linear-gradient(to right, ${bubbleColor}10, ${bubbleColor}20)` }}
      >
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
      
      {/* Accent line */}
      <div className="h-1 w-full" style={{ backgroundColor: bubbleColor }} />

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 px-4">
            <ChatAvatar type={avatarType} size={80} className="mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Hi! I'm your {displayName}.</p>
            <p className="text-sm mb-4">I can help you with:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Draft emails', 'Guest responses', 'Content ideas', 'Property descriptions'].map((item) => (
                <span 
                  key={item} 
                  className="text-xs px-3 py-1.5 rounded-full border"
                  style={{ backgroundColor: `${bubbleColor}30`, borderColor: bubbleColor, color: bubbleColor }}
                >
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
      <div className="border-t bg-muted/30">
        {/* Quick Prompt Categories */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-2 flex-wrap">
            {quickPromptCategories.map(category => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category.id)}
                  className="text-xs h-7"
                >
                  <IconComponent className="h-3 w-3 mr-1" />
                  {category.name}
                </Button>
              );
            })}
          </div>
          
          {/* Active Category Prompts */}
          {activeCategory && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {quickPromptCategories
                .find(c => c.id === activeCategory)
                ?.prompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs px-2.5 py-1.5 rounded-md bg-background border hover:bg-accent transition-colors"
                  >
                    {prompt.title}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or select a quick prompt above..."
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
