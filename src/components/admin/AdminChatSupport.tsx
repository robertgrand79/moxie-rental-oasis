
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, User, Bot, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatSession {
  id: string;
  guestName: string;
  email?: string;
  status: 'active' | 'pending' | 'resolved';
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  sender: 'guest' | 'admin' | 'ai';
  timestamp: string;
  sessionId: string;
}

const AdminChatSupport = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mock data for demonstration
    const mockSessions: ChatSession[] = [
      {
        id: '1',
        guestName: 'Sarah Johnson',
        email: 'sarah@email.com',
        status: 'active',
        lastMessage: 'Is there parking available at the downtown property?',
        timestamp: '2024-01-15T14:30:00Z',
        unreadCount: 2
      },
      {
        id: '2',
        guestName: 'Mike Chen',
        email: 'mike@email.com',
        status: 'pending',
        lastMessage: 'What time is check-in?',
        timestamp: '2024-01-15T13:45:00Z',
        unreadCount: 1
      },
      {
        id: '3',
        guestName: 'Emily Davis',
        status: 'resolved',
        lastMessage: 'Thank you for the help!',
        timestamp: '2024-01-15T12:00:00Z',
        unreadCount: 0
      }
    ];
    setChatSessions(mockSessions);
  }, []);

  const generateAISuggestion = async (conversation: Message[]) => {
    setLoading(true);
    try {
      const conversationContext = conversation.slice(-5).map(msg => 
        `${msg.sender}: ${msg.content}`
      ).join('\n');

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: `Based on this conversation about vacation rentals, suggest a helpful response:\n${conversationContext}`,
          conversationHistory: []
        }
      });

      if (error) throw error;

      setAiSuggestion(data.response);
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = (sessionId: string) => {
    // Mock messages for demonstration
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hi, I\'m interested in booking the downtown loft. Is it available for next weekend?',
        sender: 'guest',
        timestamp: '2024-01-15T14:00:00Z',
        sessionId
      },
      {
        id: '2',
        content: 'Hello! Yes, the downtown loft is available for next weekend. Would you like me to check the exact dates?',
        sender: 'admin',
        timestamp: '2024-01-15T14:05:00Z',
        sessionId
      },
      {
        id: '3',
        content: 'That would be great! I\'m looking at February 10-12. Also, is there parking available?',
        sender: 'guest',
        timestamp: '2024-01-15T14:30:00Z',
        sessionId
      }
    ];
    setMessages(mockMessages);
    
    // Generate AI suggestion based on conversation
    if (mockMessages.length > 0) {
      generateAISuggestion(mockMessages);
    }
  };

  const selectSession = (session: ChatSession) => {
    setSelectedSession(session);
    loadMessages(session.id);
    
    // Mark as read
    setChatSessions(prev => prev.map(s => 
      s.id === session.id ? { ...s, unreadCount: 0 } : s
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'admin',
      timestamp: new Date().toISOString(),
      sessionId: selectedSession.id
    };

    setMessages(prev => [...prev, message]);
    
    // Update session last message
    setChatSessions(prev => prev.map(s => 
      s.id === selectedSession.id 
        ? { ...s, lastMessage: newMessage, timestamp: message.timestamp }
        : s
    ));

    setNewMessage('');
    setAiSuggestion('');
  };

  const useAISuggestion = () => {
    setNewMessage(aiSuggestion);
    setAiSuggestion('');
  };

  const markSessionResolved = () => {
    if (!selectedSession) return;

    setChatSessions(prev => prev.map(s => 
      s.id === selectedSession.id ? { ...s, status: 'resolved' } : s
    ));
    
    setSelectedSession(prev => prev ? { ...prev, status: 'resolved' } : null);
    
    toast({
      title: "Session Resolved",
      description: "Chat session has been marked as resolved.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'resolved': return <AlertCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Chat Support Center</h2>
        <p className="text-gray-600 mt-1">Manage guest inquiries with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Active Chats
            </CardTitle>
            <CardDescription>
              {chatSessions.filter(s => s.status !== 'resolved').length} active conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[480px]">
              <div className="space-y-2 p-4">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => selectSession(session)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedSession?.id === session.id 
                        ? 'bg-blue-50 border-blue-200 border' 
                        : 'hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-sm">{session.guestName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {session.unreadCount}
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                          {getStatusIcon(session.status)}
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{session.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(session.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      {selectedSession.guestName}
                    </CardTitle>
                    <CardDescription>{selectedSession.email}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedSession.status)}>
                      {selectedSession.status}
                    </Badge>
                    {selectedSession.status !== 'resolved' && (
                      <Button onClick={markSessionResolved} variant="outline" size="sm">
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-[480px]">
                {/* Messages */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender === 'admin'
                              ? 'bg-blue-600 text-white'
                              : message.sender === 'ai'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center mb-1">
                            {message.sender === 'admin' ? (
                              <User className="h-3 w-3 mr-1" />
                            ) : message.sender === 'ai' ? (
                              <Bot className="h-3 w-3 mr-1" />
                            ) : (
                              <MessageSquare className="h-3 w-3 mr-1" />
                            )}
                            <span className="text-xs opacity-75">
                              {message.sender === 'admin' ? 'You' : message.sender === 'ai' ? 'AI' : 'Guest'}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* AI Suggestion */}
                {aiSuggestion && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Bot className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-purple-800">AI Suggestion</span>
                      </div>
                      <Button onClick={useAISuggestion} size="sm" variant="outline">
                        Use This Response
                      </Button>
                    </div>
                    <p className="text-sm text-purple-700">{aiSuggestion}</p>
                  </div>
                )}

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={selectedSession.status === 'resolved'}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || selectedSession.status === 'resolved'}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Chat Selected</h3>
                  <p className="text-gray-600">Select a chat session to start responding to guest inquiries</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatSupport;
