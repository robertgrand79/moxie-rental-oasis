
import React, { useState, useEffect } from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Send, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailTestingCard = () => {
  const { settings, saveSetting } = useStableSiteSettings();
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const [emailSetupVerified, setEmailSetupVerified] = useState(false);
  const [emailLastTestedAt, setEmailLastTestedAt] = useState<string | null>(null);
  const [emailVerificationDetails, setEmailVerificationDetails] = useState<any>({});

  // Load email verification status from settings
  useEffect(() => {
    setEmailSetupVerified(settings.emailSetupVerified === 'true' || settings.emailSetupVerified === true);
    setEmailLastTestedAt(settings.emailLastTestedAt && settings.emailLastTestedAt !== 'null' ? settings.emailLastTestedAt : null);
    
    // Parse verification details
    try {
      const details = typeof settings.emailVerificationDetails === 'string' 
        ? JSON.parse(settings.emailVerificationDetails) 
        : settings.emailVerificationDetails || {};
      setEmailVerificationDetails(details);
    } catch (e) {
      setEmailVerificationDetails({});
    }
  }, [settings]);

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address to send the test email to.',
        variant: 'destructive'
      });
      return;
    }

    setTesting(true);
    setLastTestResult(null);
    
    try {
      console.log('Sending test email request...');
      
      const { data, error } = await supabase.functions.invoke('send-newsletter-preview', {
        body: {
          email: testEmail,
          subject: 'SendGrid Domain Verification Test',
          content: `
            <h2>✅ SendGrid Integration Test Successful!</h2>
            <p>Congratulations! Your SendGrid configuration is working correctly with your <strong>moxievacationrentals.com</strong> domain.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3>What this test confirms:</h3>
              <ul>
                <li>✅ SendGrid API key is properly configured</li>
                <li>✅ Domain authentication is working</li>
                <li>✅ Email delivery is functional</li>
                <li>✅ Sender settings are correctly applied</li>
              </ul>
            </div>
            
            <p><strong>Configuration used for this test:</strong></p>
            <ul>
              <li><strong>From:</strong> ${settings.emailFromName} &lt;${settings.emailFromAddress}&gt;</li>
              <li><strong>Reply-To:</strong> ${settings.emailReplyTo}</li>
              <li><strong>Domain:</strong> ${settings.emailFromAddress.split('@')[1]}</li>
            </ul>
            
            <p>Your newsletter system is ready to send emails to your subscribers!</p>
          `
        }
      });

      console.log('Test email response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        const verificationDetails = {
          testEmail,
          fromEmail: data.details?.from || settings.emailFromAddress,
          fromName: data.details?.fromName || settings.emailFromName,
          replyTo: data.details?.replyTo || settings.emailReplyTo,
          domain: data.details?.domain || settings.emailFromAddress.split('@')[1],
          timestamp: data.details?.timestamp || new Date().toISOString()
        };

        // Store verification status in database
        await Promise.all([
          saveSetting('emailSetupVerified', true),
          saveSetting('emailLastTestedAt', verificationDetails.timestamp),
          saveSetting('emailVerificationDetails', verificationDetails)
        ]);

        // Update local state
        setEmailSetupVerified(true);
        setEmailLastTestedAt(verificationDetails.timestamp);
        setEmailVerificationDetails(verificationDetails);
        setLastTestResult(data);

        toast({
          title: '✅ Test Email Sent Successfully!',
          description: `Test email delivered to ${testEmail} from ${verificationDetails.fromEmail}. Email setup is now verified!`,
        });
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }

    } catch (error: any) {
      console.error('Test email error:', error);
      setLastTestResult({ success: false, error: error.message });
      
      let errorMessage = 'Failed to send test email. ';
      
      if (error.message?.includes('Admin access required')) {
        errorMessage += 'Please ensure you have admin privileges.';
      } else if (error.message?.includes('SendGrid API key')) {
        errorMessage += 'Please check your SendGrid API key configuration.';
      } else if (error.message?.includes('domain')) {
        errorMessage += 'Please verify your domain in SendGrid.';
      } else {
        errorMessage += error.message || 'Please check your configuration and try again.';
      }
      
      toast({
        title: 'Test Email Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Send className="h-5 w-5 mr-2 text-green-600" />
          Test Email Configuration
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Send a test email to verify your SendGrid and domain configuration
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
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
          onClick={handleTestEmail}
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

        {/* Test Result Display */}
        {lastTestResult && (
          <div className={`p-4 rounded-lg border ${
            lastTestResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start">
              {lastTestResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              )}
              <div className="text-sm">
                <h4 className={`font-medium mb-2 ${
                  lastTestResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {lastTestResult.success ? '✅ Test Email Sent Successfully!' : '❌ Test Email Failed'}
                </h4>
                {lastTestResult.success && lastTestResult.details && (
                  <div className="space-y-1 text-green-700">
                    <p><strong>To:</strong> {lastTestResult.details.to}</p>
                    <p><strong>From:</strong> {lastTestResult.details.fromName} &lt;{lastTestResult.details.from}&gt;</p>
                    <p><strong>Reply-To:</strong> {lastTestResult.details.replyTo}</p>
                    <p><strong>Domain:</strong> {lastTestResult.details.domain}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-xs">Sent at {new Date(lastTestResult.details.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                {!lastTestResult.success && (
                  <p className="text-red-700">{lastTestResult.error}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Configuration Checklist:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              SendGrid account created
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              API key generated and added to secrets
            </li>
            <li className="flex items-center">
              {emailSetupVerified ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              Domain moxievacationrentals.com verified in SendGrid
            </li>
            <li className="flex items-center">
              {emailSetupVerified ? (
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
              )}
              Test email sent successfully from verified domain
            </li>
          </ul>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="text-yellow-800">
              <strong>Important:</strong> Emails will only be delivered reliably once your domain is verified in SendGrid. 
              Unverified domains may result in emails being blocked or marked as spam.
            </p>
          </div>
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default EmailTestingCard;
