
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';

interface EmailTestingFormProps {
  testEmail: string;
  setTestEmail: (email: string) => void;
  testing: boolean;
  emailSetupVerified: boolean;
  onTestEmail: () => void;
}

const EmailTestingForm = ({
  testEmail,
  setTestEmail,
  testing,
  emailSetupVerified,
  onTestEmail
}: EmailTestingFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="testEmail">Test Email Address</Label>
        <Input
          id="testEmail"
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="test@example.com"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          We'll send a test email to this address using your configured settings
        </p>
      </div>

      <Button 
        onClick={onTestEmail}
        disabled={testing || !testEmail}
        className="w-full"
        variant="outline"
      >
        {testing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Sending Test Email...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            {emailSetupVerified ? 'Re-test Email Configuration' : 'Send Test Email'}
          </>
        )}
      </Button>
    </div>
  );
};

export default EmailTestingForm;
