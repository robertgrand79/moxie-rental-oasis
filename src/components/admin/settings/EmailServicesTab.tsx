
import React, { useState } from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Mail, ExternalLink, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailServicesTab = () => {
  const { settings, saving, updateSettingOptimistic, saveSettings } = useStableSiteSettings();
  const [localSettings, setLocalSettings] = useState({
    sendgridApiKey: '',
    emailFromAddress: settings.contactEmail || 'noreply@yourdomain.com',
    emailFromName: settings.siteName || 'Your Site',
    emailReplyTo: settings.contactEmail || '',
  });
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);

  // Update local state when settings change
  React.useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      emailFromAddress: settings.contactEmail || 'noreply@yourdomain.com',
      emailFromName: settings.siteName || 'Your Site',
      emailReplyTo: settings.contactEmail || '',
    }));
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
    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter-preview', {
        body: {
          email: testEmail,
          subject: 'SendGrid Configuration Test',
          content: `
            <h2>SendGrid Test Email</h2>
            <p>Congratulations! Your SendGrid configuration is working correctly.</p>
            <p>This test email was sent from your newsletter system.</p>
            <p><strong>From:</strong> ${localSettings.emailFromName} &lt;${localSettings.emailFromAddress}&gt;</p>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
          `
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Test Email Sent!',
        description: `A test email has been sent to ${testEmail}. Check your inbox.`,
      });
    } catch (error) {
      console.error('Test email error:', error);
      toast({
        title: 'Test Email Failed',
        description: error.message || 'Failed to send test email. Please check your SendGrid configuration.',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SendGrid Configuration */}
      <EnhancedCard variant="glass">
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            SendGrid Configuration
          </EnhancedCardTitle>
          <EnhancedCardDescription>
            Configure SendGrid for sending newsletters and transactional emails
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">SendGrid API Key Required</p>
                <p className="text-blue-700 mb-2">
                  Your SendGrid API key is stored securely in Supabase secrets. To update it, use the button below.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://app.sendgrid.com/settings/api_keys', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Get SendGrid API Key
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://app.sendgrid.com/settings/sender_auth', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Verify Domain
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="emailFromName">Sender Name *</Label>
              <Input
                id="emailFromName"
                value={localSettings.emailFromName}
                onChange={(e) => handleInputChange('emailFromName', e.target.value)}
                placeholder="Your Company Name"
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
                placeholder="noreply@yourdomain.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be a verified domain in SendGrid
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
              placeholder="support@yourdomain.com"
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
            Send a test email to verify your SendGrid configuration is working
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
              We'll send a test email to this address
            </p>
          </div>

          <Button 
            onClick={handleTestEmail}
            disabled={testing || !testEmail}
            className="w-full"
            variant="outline"
          >
            <Send className="h-4 w-4 mr-2" />
            {testing ? 'Sending Test Email...' : 'Send Test Email'}
          </Button>

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
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                Domain verified in SendGrid (required for delivery)
              </li>
              <li className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                Test email sent successfully
              </li>
            </ul>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};

export default EmailServicesTab;
