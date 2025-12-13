import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Mail, Clock, Send, MessageSquare, User } from 'lucide-react';
import AIRevisionButton from './AIRevisionButton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface GuestCommunication {
  id: string;
  reservation_id: string;
  message_type: string;
  subject: string;
  message_content: string;
  sent_at?: string;
  delivery_status: string;
  scheduled_for?: string;
  created_at: string;
  property_reservations: {
    guest_name: string;
    guest_email: string;
    check_in_date: string;
    check_out_date: string;
    properties: {
      title: string;
    };
  };
}

// Function to create message templates with dynamic tenant info
const createMessageTemplates = (siteName: string, locationText: string) => ({
  welcome: {
    subject: "Welcome to {{property_name}} - Your Reservation is Confirmed!",
    content: `Dear {{guest_name}},

Thank you for booking with us! We're excited to host you at {{property_name}}.

Reservation Details:
- Check-in: {{check_in_date}}
- Check-out: {{check_out_date}}
- Property: {{property_name}}

We'll send you detailed check-in instructions closer to your arrival date.

Best regards,
${siteName} Team`
  },
  check_in: {
    subject: "Check-in Instructions for {{property_name}}",
    content: `Hi {{guest_name}},

Your check-in is tomorrow! Here are your access details for {{property_name}}:

{{check_in_instructions}}

Check-in time: 3:00 PM
Check-out time: 11:00 AM

If you have any questions, please don't hesitate to reach out.

Welcome to ${locationText}!
${siteName} Team`
  },
  check_out: {
    subject: "Thank You for Staying with Us!",
    content: `Dear {{guest_name}},

Thank you for choosing {{property_name}} for your stay in ${locationText}. We hope you had a wonderful experience!

Check-out reminders:
- Please leave keys as instructed
- Ensure all doors and windows are locked
- Check-out time is 11:00 AM

We'd love to hear about your experience and welcome you back anytime!

Best regards,
${siteName} Team`
  },
  follow_up: {
    subject: "How was your stay at {{property_name}}?",
    content: `Hi {{guest_name}},

We hope you had a fantastic time during your recent stay at {{property_name}}!

Your feedback helps us improve our service and assists future guests in making their decision. Would you mind taking a moment to share your experience?

We'd also love to welcome you back to ${locationText} anytime!

Best regards,
${siteName} Team`
  }
});

const GuestCommunication = () => {
  const [selectedReservation, setSelectedReservation] = useState<string>('');
  const [messageType, setMessageType] = useState<string>('custom');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useTenantSettings();

  // Dynamic values from tenant settings
  const siteName = settings.site_name || 'Our Team';
  const locationText = settings.heroLocationText || 'the area';
  const messageTemplates = createMessageTemplates(siteName, locationText);

  // Get organization-scoped properties
  const { properties: orgProperties, loading: propertiesLoading } = usePropertyFetch();
  const orgPropertyIds = orgProperties.map(p => p.id);

  // Fetch recent communications scoped to organization
  const { data: communications = [], isLoading: communicationsLoading } = useQuery({
    queryKey: ['guest-communications', orgPropertyIds],
    queryFn: async () => {
      if (orgPropertyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('guest_communications')
        .select(`
          *,
          property_reservations:property_reservations!inner(
            guest_name,
            guest_email,
            check_in_date,
            check_out_date,
            property_id,
            properties:properties!inner(title)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!data) return [];
      
      // Filter to only include communications for organization properties
      return data
        .filter((item: any) => orgPropertyIds.includes(item.property_reservations?.property_id))
        .map((item: any) => ({
          ...item,
          property_reservations: {
            ...item.property_reservations,
            properties: item.property_reservations.properties || { title: 'Unknown Property' }
          }
        })) as GuestCommunication[];
    },
    enabled: orgPropertyIds.length > 0,
  });

  const isLoading = propertiesLoading || communicationsLoading;

  // Fetch reservations for messaging scoped to organization
  const { data: reservations = [] } = useQuery({
    queryKey: ['reservations-for-messaging', orgPropertyIds],
    queryFn: async () => {
      if (orgPropertyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('property_reservations')
        .select(`
          id,
          guest_name,
          guest_email,
          check_in_date,
          check_out_date,
          check_in_instructions,
          properties:properties!inner(title)
        `)
        .in('property_id', orgPropertyIds)
        .eq('booking_status', 'confirmed')
        .order('check_in_date', { ascending: true });

      if (error) throw error;
      if (!data) return [];
      
      return data.map((item: any) => ({
        ...item,
        properties: item.properties || { title: 'Unknown Property' }
      }));
    },
    enabled: orgPropertyIds.length > 0,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageData: {
      reservation_id: string;
      message_type: string;
      subject: string;
      message_content: string;
      scheduled_for?: string;
    }) => {
      // First create the communication record
      const { data, error } = await supabase
        .from('guest_communications')
        .insert({
          ...messageData,
          delivery_status: messageData.scheduled_for ? 'scheduled' : 'sent',
          sent_at: messageData.scheduled_for ? null : new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // For immediate sending, we would integrate with email service here
      // For demonstration, we'll just mark it as sent
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['guest-communications'] });
      // Reset form
      setSelectedReservation('');
      setMessageType('custom');
      setSubject('');
      setContent('');
      setScheduledFor('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleTemplateSelect = (type: string) => {
    setMessageType(type);
    if (type !== 'custom' && messageTemplates[type as keyof typeof messageTemplates]) {
      const template = messageTemplates[type as keyof typeof messageTemplates];
      setSubject(template.subject);
      setContent(template.content);
    } else {
      setSubject('');
      setContent('');
    }
  };

  const processTemplate = (text: string, reservation: any) => {
    if (!reservation) return text;
    
    return text
      .replace(/\{\{guest_name\}\}/g, reservation.guest_name || '')
      .replace(/\{\{property_name\}\}/g, reservation.properties?.title || '')
      .replace(/\{\{check_in_date\}\}/g, format(new Date(reservation.check_in_date), 'MMMM dd, yyyy'))
      .replace(/\{\{check_out_date\}\}/g, format(new Date(reservation.check_out_date), 'MMMM dd, yyyy'))
      .replace(/\{\{check_in_instructions\}\}/g, reservation.check_in_instructions || 'Check-in instructions will be provided.');
  };

  const selectedReservationData = reservations.find(r => r.id === selectedReservation);

  const handleSendMessage = () => {
    if (!selectedReservation || !subject || !content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const processedSubject = processTemplate(subject, selectedReservationData);
    const processedContent = processTemplate(content, selectedReservationData);

    sendMessage.mutate({
      reservation_id: selectedReservation,
      message_type: messageType,
      subject: processedSubject,
      message_content: processedContent,
      scheduled_for: scheduledFor || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'delivered': return 'default';
      case 'scheduled': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guest Communication</h1>
          <p className="text-muted-foreground">Send messages to your guests and manage communication</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Guest Message</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Reservation</label>
                <Select value={selectedReservation} onValueChange={setSelectedReservation}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a guest reservation..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reservations.map((reservation) => (
                      <SelectItem key={reservation.id} value={reservation.id}>
                        {reservation.guest_name} - {reservation.properties.title} 
                        ({format(new Date(reservation.check_in_date), 'MMM dd')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Message Type</label>
                <Select value={messageType} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Message</SelectItem>
                    <SelectItem value="check_in">Check-in Instructions</SelectItem>
                    <SelectItem value="check_out">Check-out Thank You</SelectItem>
                    <SelectItem value="follow_up">Follow-up Message</SelectItem>
                    <SelectItem value="custom">Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Message subject"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Message Content</label>
                <div className="relative mt-1">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your message here..."
                    className="pr-12"
                    rows={8}
                  />
                  <AIRevisionButton
                    content={content}
                    onRevise={setContent}
                    disabled={!content.trim()}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Use {'{guest_name}'}, {'{property_name}'}, {'{check_in_date}'}, {'{check_out_date}'} for dynamic content
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Schedule for Later (optional)</label>
                <Input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="mt-1"
                />
              </div>

              {selectedReservationData && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium">Preview for:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReservationData.guest_name} - {selectedReservationData.properties.title}
                  </p>
                  <div className="mt-2 p-2 bg-background rounded border">
                    <p className="text-sm font-medium">Subject:</p>
                    <p className="text-sm">{processTemplate(subject, selectedReservationData)}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={sendMessage.isPending}
                >
                  {sendMessage.isPending ? 'Sending...' : (scheduledFor ? 'Schedule Message' : 'Send Message')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Communications History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Communications</CardTitle>
          <CardDescription>Messages sent to guests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading communications...</div>
          ) : communications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No messages sent yet</div>
          ) : (
            <div className="space-y-4">
              {communications.map((comm) => (
                <div key={comm.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{comm.property_reservations.guest_name}</span>
                        </div>
                        <Badge variant="outline">{comm.message_type}</Badge>
                        <Badge variant={getStatusColor(comm.delivery_status)}>
                          {comm.delivery_status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {comm.property_reservations.guest_email}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {comm.property_reservations.properties.title}
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-sm">{comm.subject}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {comm.message_content}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-muted-foreground ml-4">
                      {comm.sent_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(comm.sent_at), 'MMM dd, HH:mm')}
                        </div>
                      ) : comm.scheduled_for ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Scheduled: {format(new Date(comm.scheduled_for), 'MMM dd, HH:mm')}
                        </div>
                      ) : (
                        <span>Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestCommunication;
