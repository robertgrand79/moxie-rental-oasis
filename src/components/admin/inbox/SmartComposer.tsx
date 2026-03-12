import React, { useState, useEffect, useRef } from 'react';
import { InboxThread, ThreadReservation } from '@/hooks/useGuestInbox';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmailRichTextEditor from '@/components/admin/platform/email/EmailRichTextEditor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Loader2, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartComposerProps {
  thread: InboxThread;
  reservations: ThreadReservation[];
  onSent: () => void;
}

const SmartComposer: React.FC<SmartComposerProps> = ({
  thread,
  reservations,
  onSent,
}) => {
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canSendEmail = !!thread.guest_email;
  const canSendSms = !!thread.guest_phone;

  // Default to SMS if available, else email
  const [channel, setChannel] = useState<'sms' | 'email'>(canSendSms ? 'sms' : 'email');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedReservationId, setSelectedReservationId] = useState('');
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);

  const isEmailMode = channel === 'email';

  useEffect(() => {
    if (reservations.length > 0 && !selectedReservationId) {
      setSelectedReservationId(reservations[0].id);
    }
  }, [reservations, selectedReservationId]);

  const handleSend = async () => {
    if (!message.trim()) return;

    if (isEmailMode && !subject.trim()) {
      toast({ title: 'Subject required', description: 'Please enter a subject for the email', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      if (isEmailMode && canSendEmail) {
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
      } else if (canSendSms) {
        const { data, error } = await supabase.functions.invoke('send-sms', {
          body: { to: thread.guest_phone, message, organizationId: organization?.id },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'SMS send failed');

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

      toast({ title: 'Sent', description: `Message sent via ${isEmailMode ? 'email' : 'SMS'}` });
      setMessage('');
      setSubject('');
      setFocused(false);
      onSent();
    } catch (error: any) {
      console.error('Error sending:', error);
      toast({ title: 'Error', description: error.message || 'Failed to send', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isEmailMode) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border/40 bg-background shrink-0">
      <div className="max-w-3xl mx-auto px-4 py-3 space-y-3">
        {/* Channel toggle + reservation selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Reply via</Label>
            <div className="flex items-center gap-1.5 bg-muted/50 rounded-full p-0.5">
              <button
                onClick={() => canSendSms && setChannel('sms')}
                disabled={!canSendSms}
                className={cn(
                  'flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all font-medium',
                  channel === 'sms'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                  !canSendSms && 'opacity-40 cursor-not-allowed'
                )}
              >
                <Phone className="h-3 w-3" />
                SMS
              </button>
              <button
                onClick={() => canSendEmail && setChannel('email')}
                disabled={!canSendEmail}
                className={cn(
                  'flex items-center gap-1 text-xs px-3 py-1.5 rounded-full transition-all font-medium',
                  channel === 'email'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                  !canSendEmail && 'opacity-40 cursor-not-allowed'
                )}
              >
                <Mail className="h-3 w-3" />
                Email
              </button>
            </div>
          </div>

          {reservations.length > 1 && (
            <Select value={selectedReservationId} onValueChange={setSelectedReservationId}>
              <SelectTrigger className="h-8 text-xs w-auto min-w-[140px] rounded-full border-border/50">
                <SelectValue placeholder="Select reservation" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                {reservations.map((res) => (
                  <SelectItem key={res.id} value={res.id}>
                    <span className="text-xs">{res.property?.title} · {new Date(res.check_in_date).toLocaleDateString()}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Email subject field */}
        {isEmailMode && (
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 rounded-lg border-border/50 text-sm"
          />
        )}

        {/* Message input */}
        {isEmailMode ? (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <EmailRichTextEditor
              content={message}
              onChange={setMessage}
              placeholder="Write your email…"
              minHeight="120px"
            />
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => !message && setFocused(false)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={focused || message ? 3 : 1}
                className={cn(
                  'w-full resize-none rounded-2xl border border-border/50 bg-muted/30 px-4 py-2.5 text-sm',
                  'placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30',
                  'transition-all duration-200',
                  focused || message ? 'rounded-xl' : ''
                )}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              size="sm"
              className="h-10 w-10 rounded-full p-0 shrink-0"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Email send button */}
        {isEmailMode && (
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              size="sm"
              className="rounded-full gap-1.5 px-5"
            >
              {sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send Email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartComposer;
