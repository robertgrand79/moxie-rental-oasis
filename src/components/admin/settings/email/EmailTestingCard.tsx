
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailTestingCard = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send a test email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLastTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter-preview', {
        body: {
          email: testEmail,
          subject: 'Test Email from Your Newsletter System',
          content: `
            <h2>🎉 Email System Test</h2>
            <p>Congratulations! Your email system is working correctly.</p>
            <p>This is a test email sent from your newsletter management system to verify that:</p>
            <ul>
              <li>✅ SendGrid API is properly configured</li>
              <li>✅ Email templates are rendering correctly</li>
              <li>✅ Your sender email is verified</li>
              <li>✅ Email delivery is functioning</li>
            </ul>
            <p>You can now confidently send newsletter previews and campaigns to your subscribers.</p>
            <p><strong>Next steps:</strong></p>
            <ol>
              <li>Create your newsletter content</li>
              <li>Send preview emails to test</li>
              <li>Send campaigns to your subscribers</li>
            </ol>
          `
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setLastTestResult(data);
        toast({
          title: "Test Email Sent!",
          description: `Test email has been sent to ${testEmail}. Check your inbox (and spam folder).`,
        });
      } else {
        throw new Error(data?.error || "Failed to send test email");
      }
    } catch (error: any) {
      console.error('Test email error:', error);
      
      let errorMessage = "Failed to send test email.";
      
      if (error.message?.includes("SENDGRID_API_KEY")) {
        errorMessage = "SendGrid API key is not configured. Please add SENDGRID_API_KEY to your Supabase secrets.";
      } else if (error.message?.includes("Authentication")) {
        errorMessage = "Authentication error. Please log in again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Test Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setLastTestResult({ success: false, error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2" />
          Email System Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testEmail">Test Email Address</Label>
          <Input
            id="testEmail"
            type="email"
            placeholder="your-email@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>

        <Button
          onClick={handleSendTestEmail}
          disabled={isLoading || !testEmail}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending Test...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </>
          )}
        </Button>

        {lastTestResult && (
          <Alert className={lastTestResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {lastTestResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={lastTestResult.success ? "text-green-800" : "text-red-800"}>
              {lastTestResult.success ? (
                <div>
                  <strong>✅ Test email sent successfully!</strong>
                  <br />
                  <span className="text-sm">
                    Sent to: {lastTestResult.details?.to}
                    <br />
                    From: {lastTestResult.details?.fromName} &lt;{lastTestResult.details?.from}&gt;
                    <br />
                    Time: {new Date(lastTestResult.details?.timestamp).toLocaleString()}
                  </span>
                </div>
              ) : (
                <div>
                  <strong>❌ Test email failed</strong>
                  <br />
                  <span className="text-sm">{lastTestResult.error}</span>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>💡 Testing Tips:</strong>
            <br />
            <span className="text-sm">
              • Check your spam/junk folder if you don't receive the test email
              <br />
              • Ensure your sender email is verified in SendGrid
              <br />
              • Make sure your SendGrid API key has send permissions
            </span>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EmailTestingCard;
