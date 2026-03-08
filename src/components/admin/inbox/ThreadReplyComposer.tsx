import React, { useState, useEffect, useRef } from 'react';
import { InboxThread, ThreadReservation, ThreadMessage } from '@/hooks/useGuestInbox';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, Send, X, Loader2 } from 'lucide-react';

interface ThreadReplyComposerProps {
  thread: InboxThread;
  reservations: ThreadReservation[];
  replyToMessage?: ThreadMessage | null;
  onSent: () => void;
  onCancel: () => void;
}

const ThreadReplyComposer: React.FC<ThreadReplyComposerProps> = ({
  thread,
  reservations,
  replyToMessage,
  onSent,
  onCancel,
}) => {
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [channel, setChannel] = useState<'email' | 'sms' | 'both'>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedReservationId, setSelectedReservationId] = useState<string>('');
  const [sending, setSending] = useState(false);

  // Sync selectedReservationId when reservations load
  useEffect(() => {
    if (reservations.length > 0 && !selectedReservationId) {
      setSelectedReservationId(reservations[0].id);
    }
  }, [reservations, selectedReservationId]);

  // Pre-fill subject and channel when replying to a specific message
  useEffect(() => {
    if (replyToMessage) {
      if (replyToMessage.message_type === 'sms') {
        setChannel('sms');
      } else {
        setChannel('email');
        if (replyToMessage.subject && replyToMessage.subject !== 'SMS Message') {
          const reSubject = replyToMessage.subject.startsWith('Re:') 
            ? replyToMessage.subject 
            : `Re: ${replyToMessage.subject}`;
          setSubject(reSubject);
        }
      }
    }
  }, [replyToMessage]);

  // Auto-focus textarea on mount
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, []);

  const canSendEmail = !!thread.guest_email;
  const canSendSms = !!thread.guest_phone;

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    // Only require reservation if reservations exist
    if (reservations.length > 0 && !selectedReservationId) {
      toast({
        title: 'Error',
        description: 'Please select a reservation',
        variant: 'destructive',
      });
      return;
    }

    if ((channel === 'email' || channel === 'both') && !subject.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a subject for the email',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      const results = { email: false, sms: false };

      if ((channel === 'email' || channel === 'both') && canSendEmail) {
        const { data, error } = await supabase.functions.invoke('send-guest-email', {
          body: {
            reservationId: selectedReservationId || null,
            recipientEmail: thread.guest_email,
            recipientName: thread.guest_name || 'Guest',
            subject,
            message,
            threadId: thread.id,
            organizationId: organization?.id,
          },
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Email send failed');
        results.email = true;
      }

      if ((channel === 'sms' || channel === 'both') && canSendSms) {
        const { data, error } = await supabase.functions.invoke('send-sms', {
          body: {
            to: thread.guest_phone,
            message,
            organizationId: organization?.id,
          },
        });

        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'SMS send failed');
        results.sms = true;

        // Store SMS in guest_communications
        await supabase.from('guest_communications').insert({
          reservation_id: selectedReservationId || null,
          thread_id: thread.id,
          message_type: 'sms',
          subject: 'SMS Message',
          message_content: message,
          delivery_status: 'delivered',
          sent_at: new Date().toISOString(),
          direction: 'outbound',
        });
      }

      toast({
        title: 'Message Sent',
        description: `Successfully sent via ${
          results.email && results.sms 
            ? 'email and SMS' 
            : results.email 
            ? 'email' 
            : 'SMS'
        }`,
      });

      onSent();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Channel selector - responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Label className="shrink-0 text-sm">Send via:</Label>
        <ToggleGroup
          type="single"
          value={channel}
          onValueChange={(v) => v && setChannel(v as typeof channel)}
          className="justify-start flex-wrap"
        >
          <ToggleGroupItem value="email" disabled={!canSendEmail} className="h-9 px-3">
            <Mail className="h-4 w-4 mr-1" />
            Email
          </ToggleGroupItem>
          <ToggleGroupItem value="sms" disabled={!canSendSms} className="h-9 px-3">
            <Phone className="h-4 w-4 mr-1" />
            SMS
          </ToggleGroupItem>
          <ToggleGroupItem value="both" disabled={!canSendEmail || !canSendSms} className="h-9 px-3">
            Both
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Reservation selector */}
      {reservations.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Label className="shrink-0 text-sm">Reservation:</Label>
          <Select value={selectedReservationId} onValueChange={setSelectedReservationId}>
            <SelectTrigger className="flex-1 h-12 sm:h-10">
              <SelectValue placeholder="Select reservation" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-[100]">
              {reservations.map((res) => (
                <SelectItem key={res.id} value={res.id} className="py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{res.property?.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(res.check_in_date).toLocaleDateString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Subject (for email) */}
      {(channel === 'email' || channel === 'both') && (
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="h-10"
        />
      )}

      {/* Message content */}
      <Textarea
        ref={textareaRef}
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="resize-none min-h-[100px]"
      />

      {/* Actions - stack on mobile */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={sending}
          className="h-11 sm:h-10"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button 
          onClick={handleSend} 
          disabled={sending}
          className="h-11 sm:h-10"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-1" />
          )}
          Send Message
        </Button>
      </div>
    </div>
  );
};

export default ThreadReplyComposer;
