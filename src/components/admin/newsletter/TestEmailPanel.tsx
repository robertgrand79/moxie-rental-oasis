import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, Send } from 'lucide-react';

interface TestEmailPanelProps {
  testEmail: string;
  setTestEmail: (email: string) => void;
  onSendTest: () => void;
  isSending: boolean;
  disabled?: boolean;
}

const TestEmailPanel = ({
  testEmail,
  setTestEmail,
  onSendTest,
  isSending,
  disabled = false
}: TestEmailPanelProps) => {
  const isValidEmail = testEmail && testEmail.includes('@') && testEmail.includes('.');

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          Send Test Preview
        </CardTitle>
        <CardDescription className="text-sm">
          Send a preview of your newsletter to test how it looks in an email client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter test email address..."
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            disabled={isSending || disabled}
            className="flex-1"
          />
          <Button
            onClick={onSendTest}
            disabled={!isValidEmail || isSending || disabled}
            size="sm"
            variant="default"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Test
              </>
            )}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          The test email will include all your content, formatting, and images exactly as they'll appear to subscribers.
        </div>
      </CardContent>
    </Card>
  );
};

export default TestEmailPanel;