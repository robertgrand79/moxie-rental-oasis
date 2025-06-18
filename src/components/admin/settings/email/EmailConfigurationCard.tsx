
import React, { useState, useEffect } from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Mail } from 'lucide-react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';

const EmailConfigurationCard = () => {
  const { settings, saving, saveSettings } = useStableSiteSettings();
  const [localSettings, setLocalSettings] = useState({
    emailFromAddress: settings.emailFromAddress || 'noreply@moxievacationrentals.com',
    emailFromName: settings.emailFromName || settings.siteName || 'Moxie Vacation Rentals',
    emailReplyTo: settings.emailReplyTo || settings.contactEmail || 'contact@moxievacationrentals.com',
  });

  // Update local state when settings change
  useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      emailFromAddress: settings.emailFromAddress || 'noreply@moxievacationrentals.com',
      emailFromName: settings.emailFromName || settings.siteName || 'Moxie Vacation Rentals',
      emailReplyTo: settings.emailReplyTo || settings.contactEmail || 'contact@moxievacationrentals.com',
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

  return (
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
  );
};

export default EmailConfigurationCard;
