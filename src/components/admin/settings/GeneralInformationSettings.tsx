
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Save, Settings, AlertCircle } from 'lucide-react';
import { AIInput } from '@/components/ui/ai-input';
import { AITextarea } from '@/components/ui/ai-textarea';

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
        <AIInput
          label="Site Name *"
          id="siteName"
          value={siteData.siteName}
          onChange={(e) => onInputChange('siteName', e.target.value)}
          onValueChange={(value) => onInputChange('siteName', value)}
          placeholder="Your business name"
          aiPrompt="Generate a memorable, professional business name for a vacation rental company. The name should be easy to remember, convey trust and quality, and work well for branding."
          aiTooltip="Generate site name with AI"
        />

        <AIInput
          label="Tagline"
          id="tagline"
          value={siteData.tagline}
          onChange={(e) => onInputChange('tagline', e.target.value)}
          onValueChange={(value) => onInputChange('tagline', value)}
          placeholder="A short, memorable phrase about your business"
          aiPrompt="Create a catchy, memorable tagline for a vacation rental business. It should be concise (under 10 words), convey the unique value proposition, and inspire travelers to book."
          aiTooltip="Generate tagline with AI"
        />

        <AITextarea
          label="Site Description *"
          id="description"
          value={siteData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          onValueChange={(value) => onInputChange('description', value)}
          placeholder="Describe your business and what makes it special"
          rows={3}
          aiPrompt="Write an engaging, professional business description for a vacation rental company. Include what makes the company special, the types of properties offered, and the experience guests can expect. Keep it between 2-4 sentences."
          aiTooltip="Generate description with AI"
        />

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
