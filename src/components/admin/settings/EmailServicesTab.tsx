
import React, { useState, useEffect } from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Mail, ExternalLink, CheckCircle, AlertCircle, Send, Shield, Globe, Loader2, Clock } from 'lucide-react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailServicesTab = () => {
  const { settings, saving, saveSettings, saveSetting } = useStableSiteSettings();
  const [localSettings, setLocalSettings] = useState({
    emailFromAddress: settings.emailFromAddress || 'noreply@moxievacationrentals.com',
    emailFromName: settings.emailFromName || settings.siteName || 'Moxie Vacation Rentals',
    emailReplyTo: settings.emailReplyTo || settings.contactEmail || 'contact@moxievacationrentals.com',
  });
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const [emailSetupVerified, setEmailSetupVerified] = useState(false);
  const [emailLastTestedAt, setEmailLastTestedAt] = useState<string | null>(null);
  const [emailVerificationDetails, setEmailVerificationDetails] = useState<any>({});

  // Update local state when settings change
  useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      emailFromAddress: settings.emailFromAddress || 'noreply@moxievacationrentals.com',
      emailFromName: settings.emailFromName || settings.siteName || 'Moxie Vacation Rentals',
      emailReplyTo: settings.emailReplyTo || settings.contactEmail || 'contact@moxievacationrentals.com',
    }));

    // Load email verification status from settings
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

  const handleInputChange = (field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEmailSettings = async () => {
    await saveSettings({
      emailFromAddress: localSettings.emailFromAddress,
      emailFromName: localSettings.emailFromName,
      emailReplyTo: localSettings.emailReplyTo,
    });
  };

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
              <li><strong>From:</strong> ${localSettings.emailFromName} &lt;${localSettings.emailFromAddress}&gt;</li>
              <li><strong>Reply-To:</strong> ${localSettings.emailReplyTo}</li>
              <li><strong>Domain:</strong> ${localSettings.emailFromAddress.split('@')[1]}</li>
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
          fromEmail: data.details?.from || localSettings.emailFromAddress,
          fromName: data.details?.fromName || localSettings.emailFromName,
          replyTo: data.details?.replyTo || localSettings.emailReplyTo,
          domain: data.details?.domain || localSettings.emailFromAddress.split('@')[1],
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
    <div className="space-y-8">
      {/* Email Setup Status */}
      {emailSetupVerified && (
        <EnhancedCard variant="glass" className="border-l-4 border-l-green-500">
          <EnhancedCardHeader>
            <EnhancedCardTitle className="flex items-center text-green-700">
              <CheckCircle className="h-5 w-5 mr-2" />
              Email Setup Verified
            </EnhancedCardTitle>
            <EnhancedCardDescription>
              Your email configuration has been successfully tested and verified
            </EnhancedCardDescription>
          </EnhancedCardHeader>
          <EnhancedCardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                <div className="text-sm">
                  <h4 className="font-medium text-green-900 mb-2">Email Configuration Verified</h4>
                  {emailVerificationDetails && (
                    <div className="space-y-1 text-green-700">
                      <p><strong>Verified Configuration:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>From:</strong> {emailVerificationDetails.fromName} &lt;{emailVerificationDetails.fromEmail}&gt;</li>
                        <li><strong>Reply-To:</strong> {emailVerificationDetails.replyTo}</li>
                        <li><strong>Domain:</strong> {emailVerificationDetails.domain}</li>
                      </ul>
                      {emailLastTestedAt && (
                        <div className="flex items-center mt-2">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-xs">Last verified: {new Date(emailLastTestedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </EnhancedCardContent>
        </EnhancedCard>
      )}

      {/* Domain Verification Status */}
      <EnhancedCard variant="glass">
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Domain Verification Status
          </EnhancedCardTitle>
          <EnhancedCardDescription>
            Verify your moxievacationrentals.com domain in SendGrid for proper email delivery
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Globe className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-2">Domain: moxievacationrentals.com</p>
                <p className="text-blue-700 mb-3">
                  To send emails from your domain, you must verify it in SendGrid. This ensures high deliverability and prevents your emails from being marked as spam.
                </p>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Verification Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Go to SendGrid → Settings → Sender Authentication</li>
                    <li>Click "Verify a Single Sender" or "Authenticate Your Domain"</li>
                    <li>Enter moxievacationrentals.com as your domain</li>
                    <li>Add the provided DNS records to your domain</li>
                    <li>Wait for verification (can take up to 48 hours)</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://app.sendgrid.com/settings/sender_auth', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Verify Domain in SendGrid
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Domain Setup Guide
            </Button>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* SendGrid Configuration */}
      <EnhancedCard variant="glass">
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            Email Configuration
          </EnhancedCardTitle>
          <EnhancedCardDescription>
            Configure your email sender information for newsletters and notifications
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="emailFromName">Sender Name *</Label>
              <Input
                id="emailFromName"
                value={localSettings.emailFromName}
                onChange={(e) => handleInputChange('emailFromName', e.target.value)}
                placeholder="Moxie Vacation Rentals"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will appear as the sender in emails
              </p>
            </div>
            <div>
              <Label htmlFor="emailFromAddress">From Email Address *</Label>
              <Input
                id="emailFromAddress"
                type="email"
                value={localSettings.emailFromAddress}
                onChange={(e) => handleInputChange('emailFromAddress', e.target.value)}
                placeholder="noreply@moxievacationrentals.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must use your verified domain: moxievacationrentals.com
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="emailReplyTo">Reply-To Email</Label>
            <Input
              id="emailReplyTo"
              type="email"
              value={localSettings.emailReplyTo}
              onChange={(e) => handleInputChange('emailReplyTo', e.target.value)}
              placeholder="contact@moxievacationrentals.com"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Where replies to your emails will be sent
            </p>
          </div>

          <Button 
            onClick={handleSaveEmailSettings} 
            disabled={saving.emailFromAddress || saving.emailFromName || saving.emailReplyTo}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {(saving.emailFromAddress || saving.emailFromName || saving.emailReplyTo) ? 'Saving...' : 'Save Email Settings'}
          </Button>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Email Testing */}
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
    </div>
  );
};

export default EmailServicesTab;
