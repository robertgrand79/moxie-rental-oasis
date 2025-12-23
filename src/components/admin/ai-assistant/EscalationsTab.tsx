import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Clock, MessageSquare, Send, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Escalation {
  id: string;
  guest_question: string;
  conversation_context: any;
  status: 'pending' | 'answered' | 'dismissed';
  host_response: string | null;
  add_to_faq: boolean;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  session_id: string;
}

const EscalationsTab = () => {
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [response, setResponse] = useState('');
  const [addToFaq, setAddToFaq] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'answered' | 'all'>('pending');

  useEffect(() => {
    if (organization?.id) {
      fetchEscalations();
    } else if (!orgLoading) {
      setLoading(false);
    }
  }, [organization?.id, filter, orgLoading]);

  const fetchEscalations = async () => {
    if (!organization?.id) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('assistant_escalations')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEscalations((data || []) as unknown as Escalation[]);
    } catch (error) {
      console.error('Error fetching escalations:', error);
      toast.error('Failed to load escalations');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedEscalation || !response.trim() || !user) return;

    setSubmitting(true);
    try {
      // Update escalation with response
      const { error: updateError } = await supabase
        .from('assistant_escalations')
        .update({
          host_response: response.trim(),
          status: 'answered',
          answered_at: new Date().toISOString(),
          answered_by: user.id,
          add_to_faq: addToFaq
        })
        .eq('id', selectedEscalation.id);

      if (updateError) throw updateError;

      // If add to FAQ is checked, add it to assistant settings
      if (addToFaq) {
        const { data: settings } = await supabase
          .from('assistant_settings')
          .select('custom_faqs')
          .eq('organization_id', organization?.id)
          .single();

        const existingFaqs = (settings?.custom_faqs as any[]) || [];
        const newFaq = {
          question: selectedEscalation.guest_question,
          answer: response.trim()
        };

        await supabase
          .from('assistant_settings')
          .update({
            custom_faqs: [...existingFaqs, newFaq]
          })
          .eq('organization_id', organization?.id);
      }

      toast.success('Response sent successfully' + (addToFaq ? ' and added to FAQ' : ''));
      setSelectedEscalation(null);
      setResponse('');
      setAddToFaq(false);
      fetchEscalations();
    } catch (error) {
      console.error('Error responding to escalation:', error);
      toast.error('Failed to send response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async (escalationId: string) => {
    try {
      const { error } = await supabase
        .from('assistant_escalations')
        .update({
          status: 'dismissed',
          answered_at: new Date().toISOString(),
          answered_by: user?.id
        })
        .eq('id', escalationId);

      if (error) throw error;

      toast.success('Escalation dismissed');
      if (selectedEscalation?.id === escalationId) {
        setSelectedEscalation(null);
      }
      fetchEscalations();
    } catch (error) {
      console.error('Error dismissing escalation:', error);
      toast.error('Failed to dismiss escalation');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'answered':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />Answered</Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="bg-muted text-muted-foreground"><X className="h-3 w-3 mr-1" />Dismissed</Badge>;
      default:
        return null;
    }
  };

  const pendingCount = escalations.filter(e => e.status === 'pending').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Escalations List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Guest Questions
                {pendingCount > 0 && (
                  <Badge className="bg-amber-500">{pendingCount}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Questions the AI assistant escalated for your review
              </CardDescription>
            </div>
          </div>
          
          {/* Filter buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={filter === 'answered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('answered')}
            >
              Answered
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : escalations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No {filter === 'all' ? '' : filter} escalations</p>
                <p className="text-sm mt-1">When the AI can't answer a question, it will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {escalations.map((escalation) => (
                  <div
                    key={escalation.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedEscalation?.id === escalation.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedEscalation(escalation);
                      setResponse(escalation.host_response || '');
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">
                          {escalation.guest_question}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(escalation.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(escalation.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {escalation.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismiss(escalation.id);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Response Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
          <CardDescription>
            {selectedEscalation 
              ? 'Provide an answer to this guest question'
              : 'Select an escalation to respond'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedEscalation ? (
            <div className="space-y-4">
              {/* Guest Question */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Guest asked:</p>
                <p className="font-medium">{selectedEscalation.guest_question}</p>
              </div>

              {/* Conversation Context */}
              {selectedEscalation.conversation_context && 
               Array.isArray(selectedEscalation.conversation_context) && 
               (selectedEscalation.conversation_context as any[]).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Conversation context:</p>
                  <ScrollArea className="h-32 border rounded-lg p-3">
                    <div className="space-y-2 text-sm">
                      {(selectedEscalation.conversation_context as any[]).slice(-5).map((msg: any, idx: number) => (
                        <div key={idx} className={msg.role === 'user' ? 'text-right' : ''}>
                          <span className={`inline-block px-2 py-1 rounded ${
                            msg.role === 'user' ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            {msg.content?.substring(0, 100)}{msg.content?.length > 100 ? '...' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <Separator />

              {/* Response Input */}
              {selectedEscalation.status === 'pending' ? (
                <>
                  <div>
                    <Textarea
                      placeholder="Type your response..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>

                  {/* Add to FAQ checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="add-to-faq"
                      checked={addToFaq}
                      onCheckedChange={(checked) => setAddToFaq(checked === true)}
                    />
                    <label
                      htmlFor="add-to-faq"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Add this Q&A to the FAQ (AI will learn from it)
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRespond}
                      disabled={!response.trim() || submitting}
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submitting ? 'Sending...' : 'Send Response'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDismiss(selectedEscalation.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm font-medium text-green-600 mb-1">Your response:</p>
                  <p>{selectedEscalation.host_response}</p>
                  {selectedEscalation.add_to_faq && (
                    <Badge className="mt-2" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Added to FAQ
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an escalation from the list to respond</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalationsTab;
