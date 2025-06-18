
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Bot, Send, User, Sparkles, CheckCircle, X, RefreshCw, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useContentApproval } from '@/hooks/useContentApproval';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  generatedContent?: {
    type: 'poi' | 'events' | 'lifestyle' | 'site-content';
    data: any;
    preview?: string;
  };
}

interface QuickAction {
  id: string;
  label: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
}

const UnifiedAIChat = () => {
  const { toast } = useToast();
  const { addContentItem, refetch } = useContentApproval();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appliedContentIds, setAppliedContentIds] = useState<Set<string>>(new Set());
  const [buttonLoadingStates, setButtonLoadingStates] = useState<{[key: string]: boolean}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'enhance-poi',
      label: 'Enhance POI Data',
      description: 'Improve existing points of interest with better descriptions',
      prompt: 'Please review and enhance all my points of interest data. Add missing descriptions, improve existing ones, and fill in any missing contact information.',
      icon: <Sparkles className="h-4 w-4" />
    },
    {
      id: 'generate-events',
      label: 'Create Events',
      description: 'Generate new local events for Eugene',
      prompt: 'Create 5 interesting local events happening in Eugene, Oregon that would appeal to vacation rental guests. Include festivals, outdoor activities, and cultural events.',
      icon: <Bot className="h-4 w-4" />
    },
    {
      id: 'lifestyle-content',
      label: 'Lifestyle Content',
      description: 'Generate lifestyle gallery content',
      prompt: 'Create engaging lifestyle content showcasing the Eugene experience. Focus on outdoor activities, local culture, and unique experiences that vacation rental guests would love.',
      icon: <Sparkles className="h-4 w-4" />
    },
    {
      id: 'site-content',
      label: 'Improve Site Copy',
      description: 'Enhance website text and descriptions',
      prompt: 'Review my website content and suggest improvements. Make the copy more engaging, professional, and conversion-focused for vacation rental guests.',
      icon: <RefreshCw className="h-4 w-4" />
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message on component mount
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I\'m your AI content assistant. I can help you generate, enhance, and manage all types of content for your vacation rental website. Generated content can be sent for approval or applied directly. What would you like to work on today?',
        timestamp: new Date(),
        suggestions: [
          'Generate new points of interest',
          'Enhance existing content',
          'Create local events',
          'Improve website copy'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const setButtonLoading = (buttonId: string, loading: boolean) => {
    setButtonLoadingStates(prev => ({
      ...prev,
      [buttonId]: loading
    }));
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log('Sending message to AI unified chat function...');
      
      const { data, error } = await supabase.functions.invoke('ai-unified-chat', {
        body: {
          message: content,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('AI response received:', data);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        generatedContent: data.generatedContent,
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.generatedContent) {
        toast({
          title: "Content Generated",
          description: `Generated ${data.generatedContent.type} content successfully`,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const handleSendForApproval = async (messageId: string) => {
    const buttonId = `approval-${messageId}`;
    const message = messages.find(m => m.id === messageId);
    
    if (!message?.generatedContent || buttonLoadingStates[buttonId]) return;

    setButtonLoading(buttonId, true);

    try {
      console.log('Sending content for approval:', message.generatedContent);

      const { data, error } = await supabase.functions.invoke('apply-generated-content', {
        body: {
          type: message.generatedContent.type,
          data: message.generatedContent.data,
          sendForApproval: true
        }
      });

      if (error) {
        console.error('Error sending for approval:', error);
        throw error;
      }

      console.log('Content sent for approval successfully:', data);

      setAppliedContentIds(prev => new Set([...prev, messageId]));
      refetch(); // Refresh the content approval list

      toast({
        title: "Content Sent for Approval",
        description: `${data.itemsCount} item(s) sent to the approval workflow`,
      });
    } catch (error) {
      console.error('Error sending content for approval:', error);
      toast({
        title: "Error",
        description: "Failed to send content for approval. Please try again.",
        variant: "destructive"
      });
    } finally {
      setButtonLoading(buttonId, false);
    }
  };

  const handleApplyDirectly = async (messageId: string) => {
    const buttonId = `apply-${messageId}`;
    const message = messages.find(m => m.id === messageId);
    
    if (!message?.generatedContent || buttonLoadingStates[buttonId]) return;

    setButtonLoading(buttonId, true);

    try {
      console.log('Applying content directly:', message.generatedContent);

      const { data, error } = await supabase.functions.invoke('apply-generated-content', {
        body: {
          type: message.generatedContent.type,
          data: message.generatedContent.data,
          sendForApproval: false
        }
      });

      if (error) {
        console.error('Error applying content:', error);
        throw error;
      }

      console.log('Content applied successfully:', data);

      setAppliedContentIds(prev => new Set([...prev, messageId]));

      toast({
        title: "Content Applied",
        description: `${data.itemsCount} item(s) applied to your database`,
      });
    } catch (error) {
      console.error('Error applying content:', error);
      toast({
        title: "Error",
        description: "Failed to apply content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setButtonLoading(buttonId, false);
    }
  };

  const handleDiscard = (messageId: string) => {
    setAppliedContentIds(prev => new Set([...prev, messageId]));
    toast({
      title: "Content Discarded",
      description: "Generated content has been discarded",
    });
  };

  return (
    <div className="flex flex-col h-[800px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-blue-600" />
            AI Content Assistant
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 text-left justify-start"
                  onClick={() => handleQuickAction(action)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">{action.icon}</div>
                    <div>
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  <div className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Generated Content Preview */}
                  {message.generatedContent && (
                    <div className="ml-11 bg-white border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          Generated {message.generatedContent.type}
                        </Badge>
                        {appliedContentIds.has(message.id) ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Applied/Sent for Approval
                          </Badge>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendForApproval(message.id)}
                              disabled={buttonLoadingStates[`approval-${message.id}`]}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              {buttonLoadingStates[`approval-${message.id}`] ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              Send for Approval
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApplyDirectly(message.id)}
                              disabled={buttonLoadingStates[`apply-${message.id}`]}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {buttonLoadingStates[`apply-${message.id}`] ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              )}
                              Apply Directly
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDiscard(message.id)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Discard
                            </Button>
                          </div>
                        )}
                      </div>
                      {message.generatedContent.preview && (
                        <div className="text-sm bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                          {message.generatedContent.preview}
                        </div>
                      )}
                    </div>
                  )}

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="ml-11 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => sendMessage(suggestion)}
                          disabled={isLoading}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-600 animate-pulse" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          {/* Input Area */}
          <div className="flex space-x-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me to generate content, enhance existing data, or help with your website..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(inputValue);
                }
              }}
            />
            <Button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedAIChat;
