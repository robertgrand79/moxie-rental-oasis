import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmailRichTextEditor from './EmailRichTextEditor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Loader2 } from 'lucide-react';
import { usePlatformEmails, type PlatformEmail } from '@/hooks/usePlatformEmails';
import { usePlatformEmailTemplates } from '@/hooks/usePlatformEmailTemplates';
import type { PlatformEmailAddress } from '@/hooks/usePlatformEmailAddresses';
import { toast } from 'sonner';

interface EmailComposerProps {
  replyTo?: PlatformEmail | null;
  fromAddresses: PlatformEmailAddress[];
  onClose: () => void;
  onSent: () => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  replyTo,
  fromAddresses,
  onClose,
  onSent,
}) => {
  const { sendEmail } = usePlatformEmails();
  const { templates } = usePlatformEmailTemplates();

  const defaultFromAddress = replyTo?.to_addresses?.[0] || fromAddresses[0]?.email_address || '';

  const [fromAddress, setFromAddress] = useState(defaultFromAddress);
  const [toAddress, setToAddress] = useState(replyTo?.from_address || '');
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject}` : ''
  );
  const [bodyHtml, setBodyHtml] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBodyHtml(template.body_html);
    }
  };

  const handleSend = async () => {
    if (!toAddress) {
      toast.error('Please enter a recipient email address');
      return;
    }

    if (!fromAddress) {
      toast.error('Please select a from address');
      return;
    }

    if (!subject) {
      toast.error('Please enter a subject');
      return;
    }

    sendEmail.mutate(
      {
        to: [toAddress],
        from_email: fromAddress,
        subject,
        html: bodyHtml,
        in_reply_to_email_id: replyTo?.id,
      },
      {
        onSuccess: () => {
          onSent();
        },
        onError: (error) => {
          toast.error(`Failed to send email: ${error.message}`);
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">
          {replyTo ? 'Reply' : 'New Email'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* From */}
          <div className="space-y-2">
            <Label>From</Label>
            <Select value={fromAddress} onValueChange={setFromAddress}>
              <SelectTrigger>
                <SelectValue placeholder="Select from address" />
              </SelectTrigger>
              <SelectContent>
                {fromAddresses.map(addr => (
                  <SelectItem key={addr.id} value={addr.email_address}>
                    {addr.display_name} ({addr.email_address})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To */}
          <div className="space-y-2">
            <Label>To</Label>
            <Input
              type="email"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          {/* Template Selector */}
          {templates && templates.length > 0 && (
            <div className="space-y-2">
              <Label>Use Template (optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Body */}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[200px]"
            />
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t flex items-center justify-between">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSend}
          disabled={sendEmail.isPending}
          className="gap-2"
        >
          {sendEmail.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailComposer;
