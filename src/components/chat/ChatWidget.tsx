import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TurnstileWidget from '@/components/security/TurnstileWidget';
import { useTurnstile } from '@/hooks/useTurnstile';
import ChatAvatar from './ChatAvatar';
import { AvatarType, avatarInfo } from './avatars';

// Fun, personality-driven welcome messages for each avatar
const getPersonalizedWelcome = (avatarType: AvatarType, customWelcome?: string): string => {
  if (customWelcome) return customWelcome;
  
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
  };
  
  return greetings[avatarType] || `Hi! I'm ${avatarName}, here to help you with your stay!`;
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AssistantSettings {
  display_name: string;
  welcome_message: string;
  bubble_color: string;
  avatar_type: AvatarType;
  avatar_background_color: string;
  avatar_background_color_end: string;
  custom_avatar_url: string;
  use_custom_avatar: boolean;
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [assistantSettings, setAssistantSettings] = useState<AssistantSettings>({
    display_name: 'Travel Assistant',
    welcome_message: 'Hi! I\'m your travel assistant. How can I help you with your vacation rental needs today?',
    bubble_color: 'hsl(var(--primary))',
    avatar_type: 'captain-moxie',
    avatar_background_color: '#3B82F6',
    avatar_background_color_end: '#8B5CF6',
    custom_avatar_url: '',
    use_custom_avatar: false
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { token, isVerified, handleVerify, handleError, handleExpire } = useTurnstile();

  // Fetch assistant settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Get the organization from the current URL or context
        const { data, error } = await supabase
          .from('assistant_settings')
          .select('*')
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          const avatarType = (data.avatar_type as AvatarType) || 'captain-moxie';
          const welcomeMessage = getPersonalizedWelcome(avatarType, data.welcome_message);
          
          setAssistantSettings({
            display_name: data.display_name || '',
            welcome_message: welcomeMessage,
            bubble_color: data.bubble_color || 'hsl(var(--primary))',
            avatar_type: avatarType,
            avatar_background_color: data.avatar_background_color || '#3B82F6',
            avatar_background_color_end: data.avatar_background_color_end || '#8B5CF6',
            custom_avatar_url: data.custom_avatar_url || '',
            use_custom_avatar: data.use_custom_avatar || false
          });
          
          // Set initial welcome message with personality
          setMessages([{
            id: '1',
            text: welcomeMessage,
            isUser: false,
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error('Error fetching assistant settings:', error);
      }
    };
    
    fetchSettings();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Track if user has verified at least once this session
  useEffect(() => {
    if (isVerified && !hasVerified) {
      setHasVerified(true);
    }
  }, [isVerified, hasVerified]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Require Turnstile verification for first message if not already verified
    if (!hasVerified && TURNSTILE_SITE_KEY) {
      toast({
        title: "Verification Required",
        description: "Please complete the security check before sending a message.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: inputMessage,
          conversationHistory: conversationHistory,
          turnstileToken: token // Pass token for additional server-side validation
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: unknown) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Sorry, I'm having trouble responding right now. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 h-14 w-14 rounded-full shadow-lg z-50"
        style={{ backgroundColor: assistantSettings.bubble_color }}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-80 max-w-80 bg-background border shadow-xl z-50 transition-all duration-300 ${
      isMinimized ? 'h-14' : 'h-auto max-h-[70vh] sm:max-h-[32rem]'
    }`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 text-primary-foreground rounded-t-lg"
        style={{ backgroundColor: assistantSettings.bubble_color }}
      >
        <div className="flex items-center space-x-2">
          <ChatAvatar 
            type={assistantSettings.avatar_type}
            size={24}
            backgroundColorStart={assistantSettings.avatar_background_color}
            backgroundColorEnd={assistantSettings.avatar_background_color_end}
            customAvatarUrl={assistantSettings.custom_avatar_url}
            useCustomAvatar={assistantSettings.use_custom_avatar}
          />
          <h3 className="font-semibold">{assistantSettings.display_name || avatarInfo[assistantSettings.avatar_type]?.name || 'Assistant'}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Turnstile verification (only show if not verified and site key exists) */}
          {!hasVerified && TURNSTILE_SITE_KEY && (
            <div className="p-4 border-b bg-muted/50">
              <p className="text-xs text-muted-foreground mb-2">
                Please verify you're human to start chatting:
              </p>
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={handleVerify}
                onError={handleError}
                onExpire={handleExpire}
                theme="auto"
                size="compact"
              />
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-4 h-64 overflow-y-auto bg-gradient-to-b from-muted/20 via-background to-muted/20">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!message.isUser && (
                    <div className="mr-2 flex-shrink-0">
                      <ChatAvatar 
                        type={assistantSettings.avatar_type}
                        size={24}
                        backgroundColorStart={assistantSettings.avatar_background_color}
                        backgroundColorEnd={assistantSettings.avatar_background_color_end}
                        customAvatarUrl={assistantSettings.custom_avatar_url}
                        useCustomAvatar={assistantSettings.use_custom_avatar}
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      message.isUser
                        ? 'text-primary-foreground'
                        : 'bg-background text-foreground border shadow-sm'
                    }`}
                    style={message.isUser ? { backgroundColor: assistantSettings.bubble_color } : undefined}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="mr-2 flex-shrink-0">
                    <ChatAvatar 
                      type={assistantSettings.avatar_type}
                      size={24}
                      backgroundColorStart={assistantSettings.avatar_background_color}
                      backgroundColorEnd={assistantSettings.avatar_background_color_end}
                      customAvatarUrl={assistantSettings.custom_avatar_url}
                      useCustomAvatar={assistantSettings.use_custom_avatar}
                    />
                  </div>
                  <div className="bg-background text-foreground border shadow-sm max-w-xs px-3 py-2 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-background">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading || (!hasVerified && !!TURNSTILE_SITE_KEY)}
                className="flex-1 border-input"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!inputMessage.trim() || isLoading || (!hasVerified && !!TURNSTILE_SITE_KEY)}
                size="icon"
                style={{ backgroundColor: assistantSettings.bubble_color }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default ChatWidget;