
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Globe } from 'lucide-react';

interface GeneralInformationSettingsProps {
  siteData: any;
  onInputChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
}

const GeneralInformationSettings = ({ siteData, onInputChange, onSave }: GeneralInformationSettingsProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-blue-600" />
          General Information
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Configure your site's basic information and branding
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="siteName">Site Name *</Label>
            <Input
              id="siteName"
              value={siteData.siteName}
              onChange={(e) => onInputChange('siteName', e.target.value)}
              placeholder="Your site name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline *</Label>
            <Input
              id="tagline"
              value={siteData.tagline}
              onChange={(e) => onInputChange('tagline', e.target.value)}
              placeholder="A short, memorable tagline"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Site Description *</Label>
          <Textarea
            id="description"
            value={siteData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Describe your business and what makes it special"
            rows={3}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">This appears in search results and social media previews</p>
        </div>

        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save General Information
        </Button>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default GeneralInformationSettings;
