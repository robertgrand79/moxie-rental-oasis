
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Globe } from 'lucide-react';

interface ContactInformationSettingsProps {
  localData: {
    contactEmail: string;
    phone: string;
    address: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
  saving: Record<string, boolean>;
}

const ContactInformationSettings = ({ localData, onInputChange, onSave, saving }: ContactInformationSettingsProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-purple-600" />
          Contact Information
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Manage your site's contact details
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
        <div>
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            value={localData.contactEmail}
            onChange={(e) => onInputChange('contactEmail', e.target.value)}
            placeholder="contact@example.com"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={localData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={localData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="123 Main St, Anytown, USA"
            className="mt-1"
          />
        </div>
        <Button
          onClick={onSave}
          disabled={saving['contactEmail'] || saving['phone'] || saving['address']}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving['contactEmail'] || saving['phone'] || saving['address'] ? 'Saving...' : 'Save Contact Information'}
        </Button>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default ContactInformationSettings;
