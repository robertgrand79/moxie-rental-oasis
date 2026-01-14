
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

const EmailTestingCard = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

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
      console.log('🧪 Sending test email to:', testEmail);
      
      const { data, error } = await supabase.functions.invoke('send-newsletter-preview', {
        body: {
          testEmail: testEmail,
          subject: '🧪 Email System Test - Configuration Verified',
          organizationId: organization?.id,
          content: `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
              <h2 style="color: #667eea;">🎉 Email System Test Successful!</h2>
              <p>Congratulations! Your email system is working correctly.</p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <h3 style="color: #333; margin-top: 0;">✅ Verified Components:</h3>
                <ul style="color: #666; line-height: 1.6;">
                  <li>Resend API configuration</li>
                  <li>Email templates rendering</li>
                  <li>Sender email verification</li>
                  <li>Email delivery system</li>
                </ul>
              </div>
              <p><strong>🚀 You're ready to:</strong></p>
              <ol style="color: #666; line-height: 1.6;">
                <li>Send newsletter previews to test recipients</li>
                <li>Create and send newsletter campaigns</li>
                <li>Manage your subscriber list</li>
              </ol>
              <p style="color: #888; font-size: 14px; margin-top: 24px;">
                This test email confirms your email system is properly configured and ready for production use.
              </p>
            </div>
          `
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setLastTestResult(data);
        toast({
          title: "Test Email Sent Successfully! 🎉",
          description: `Test email sent to ${testEmail}. Check your inbox (and spam folder).`,
        });
      } else {
        throw new Error(data?.error || "Failed to send test email");
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('❌ Test email error:', err);
      
      let errorMessage = "Failed to send test email.";
      
      if (err.message?.includes("RESEND_API_KEY")) {
        errorMessage = "Resend API key issue. Please verify it's correctly configured in Supabase secrets.";
      } else if (err.message?.includes("Authentication")) {
        errorMessage = "Authentication error. Please log in again.";
      } else if (err.message?.includes("Admin access required")) {
        errorMessage = "Admin access required. Please ensure your account has admin privileges.";
      } else if (err.message?.includes("non-2xx status code")) {
        errorMessage = "Email service error. Please check your Resend domain verification and API key.";
      } else if (err.message) {
        errorMessage = err.message;
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
          <p className="text-xs text-gray-600">
            We'll send a comprehensive test email to verify your setup
          </p>
        </div>

        <Button
          onClick={handleSendTestEmail}
          disabled={isLoading || !testEmail}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending Test Email...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Configuration Test Email
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
            Method: {lastTestResult.details?.method || 'resend_api'}
            <br />
            Time: {new Date(lastTestResult.details?.timestamp).toLocaleString()}
            {lastTestResult.details?.note && (
              <>
                <br />
                Note: {lastTestResult.details.note}
              </>
            )}
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
            <strong>📧 Email Configuration Options:</strong>
            <br />
            <span className="text-sm">
              <strong>Option 1 (Recommended):</strong> Configure RESEND_API_KEY in Supabase secrets for full email functionality
              <br />
              <strong>Option 2:</strong> Use your existing Resend-Supabase integration (basic functionality)
              <br />
              ✅ Verify your sender email address in Resend dashboard
              <br />
              🔍 Ensure domain is verified for better deliverability
              <br />
              🧪 Test with both configurations to ensure reliability
            </span>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default EmailTestingCard;
