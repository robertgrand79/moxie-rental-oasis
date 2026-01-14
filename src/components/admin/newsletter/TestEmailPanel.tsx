import React, { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, Send } from 'lucide-react';

interface TestEmailPanelProps {
  testEmail: string;
  setTestEmail: (email: string) => void;
  onSendTest: () => void;
  isSending: boolean;
  disabled?: boolean;
}

const TestEmailPanel = memo(({
  testEmail,
  setTestEmail,
  onSendTest,
  isSending,
  disabled = false
}: TestEmailPanelProps) => {
  const [localEmail, setLocalEmail] = useState(testEmail);
  const isValidEmail = localEmail && localEmail.includes('@') && localEmail.includes('.');

  // Debounced update to parent - only on blur
  const handleBlur = useCallback(() => {
    setTestEmail(localEmail);
  }, [localEmail, setTestEmail]);

  // Handle local changes immediately for responsive UI
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalEmail(e.target.value);
  }, []);

  // Sync with parent when sending
  const handleSendClick = useCallback(() => {
    setTestEmail(localEmail);
    onSendTest();
  }, [localEmail, setTestEmail, onSendTest]);

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
          <input
            type="email"
            placeholder="Enter test email address..."
            value={localEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isSending || disabled}
            className="flex-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            onClick={handleSendClick}
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
});

TestEmailPanel.displayName = 'TestEmailPanel';

export default TestEmailPanel;