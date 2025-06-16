
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Phone, AlertCircle } from 'lucide-react';

interface ContactInformationSettingsProps {
  siteData: any;
  onInputChange: (field: string, value: string) => void;
  onSocialMediaChange: (platform: string, value: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  hasUnsavedChanges?: boolean;
}

const ContactInformationSettings = ({ 
  siteData, 
  onInputChange, 
  onSocialMediaChange, 
  onSave, 
  saving,
  hasUnsavedChanges = false 
}: ContactInformationSettingsProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Phone className="h-5 w-5 mr-2 text-green-600" />
          Contact Information
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1 ml-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Configure your business contact details and social media links
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={siteData.contactEmail}
              onChange={(e) => onInputChange('contactEmail', e.target.value)}
              placeholder="contact@yoursite.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={siteData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Business Address</Label>
          <Input
            id="address"
            value={siteData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="123 Main St, City, State 12345"
            className="mt-1"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Social Media Links</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={siteData.socialMedia?.facebook || ''}
                onChange={(e) => onSocialMediaChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={siteData.socialMedia?.instagram || ''}
                onChange={(e) => onSocialMediaChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourpage"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={siteData.socialMedia?.twitter || ''}
                onChange={(e) => onSocialMediaChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourpage"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="googlePlaces">Google Places</Label>
              <Input
                id="googlePlaces"
                value={siteData.socialMedia?.googlePlaces || ''}
                onChange={(e) => onSocialMediaChange('googlePlaces', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={onSave}
          disabled={saving}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Contact Information'}
        </Button>

        {hasUnsavedChanges && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                You have unsaved changes. Click "Save Contact Information" to apply them.
              </p>
            </div>
          </div>
        )}
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default ContactInformationSettings;
