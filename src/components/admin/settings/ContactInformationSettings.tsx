
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Mail } from 'lucide-react';

interface ContactInformationSettingsProps {
  siteData: any;
  onInputChange: (field: string, value: string) => void;
  onSocialMediaChange: (platform: string, value: string) => void;
  onSave: () => Promise<void>;
}

const ContactInformationSettings = ({ siteData, onInputChange, onSocialMediaChange, onSave }: ContactInformationSettingsProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2 text-green-600" />
          Contact Information
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Configure your business contact details and social media presence
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={siteData.contactEmail || ''}
              onChange={(e) => onInputChange('contactEmail', e.target.value)}
              placeholder="contact@yoursite.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={siteData.phone || ''}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              value={siteData.address || ''}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="123 Main St, City, State"
              className="mt-1"
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold mb-4">Social Media Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                value={siteData.socialMedia?.facebook || ''}
                onChange={(e) => onSocialMediaChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                value={siteData.socialMedia?.instagram || ''}
                onChange={(e) => onSocialMediaChange('instagram', e.target.value)}
                placeholder="https://instagram.com/youraccount"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter URL</Label>
              <Input
                id="twitter"
                value={siteData.socialMedia?.twitter || ''}
                onChange={(e) => onSocialMediaChange('twitter', e.target.value)}
                placeholder="https://twitter.com/youraccount"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="googlePlaces">Google Places URL</Label>
              <Input
                id="googlePlaces"
                value={siteData.socialMedia?.googlePlaces || ''}
                onChange={(e) => onSocialMediaChange('googlePlaces', e.target.value)}
                placeholder="https://maps.google.com/yourplace"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Contact & Social Settings
        </Button>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default ContactInformationSettings;
