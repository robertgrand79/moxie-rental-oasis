
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Settings, AlertCircle } from 'lucide-react';

interface GeneralInformationSettingsProps {
  siteData: any;
  onInputChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  hasUnsavedChanges?: boolean;
}

const GeneralInformationSettings = ({ 
  siteData, 
  onInputChange, 
  onSave, 
  saving,
  hasUnsavedChanges = false 
}: GeneralInformationSettingsProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-600" />
          General Information
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1 ml-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Configure your site's basic information and branding
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
        <div>
          <Label htmlFor="siteName">Site Name *</Label>
          <Input
            id="siteName"
            value={siteData.siteName}
            onChange={(e) => onInputChange('siteName', e.target.value)}
            placeholder="Your business name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={siteData.tagline}
            onChange={(e) => onInputChange('tagline', e.target.value)}
            placeholder="A short, memorable phrase about your business"
            className="mt-1"
          />
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
        </div>

        <Button 
          onClick={onSave}
          disabled={saving}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save General Information'}
        </Button>

        {hasUnsavedChanges && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                You have unsaved changes. Click "Save General Information" to apply them.
              </p>
            </div>
          </div>
        )}
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default GeneralInformationSettings;
