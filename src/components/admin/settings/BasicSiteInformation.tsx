
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Globe } from 'lucide-react';

interface BasicSiteInformationProps {
  localData: {
    siteName: string;
    siteLogo: string;
    tagline: string;
    description: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
  saving: Record<string, boolean>;
}

const BasicSiteInformation = ({ localData, onInputChange, onSave, saving }: BasicSiteInformationProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2 text-blue-600" />
          Basic Site Information
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Manage your site's core identity and branding elements
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
        <div>
          <Label htmlFor="siteName">Site Name *</Label>
          <Input
            id="siteName"
            value={localData.siteName}
            onChange={(e) => onInputChange('siteName', e.target.value)}
            placeholder="Your Company Name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="siteLogo">Site Logo URL</Label>
          <Input
            id="siteLogo"
            value={localData.siteLogo}
            onChange={(e) => onInputChange('siteLogo', e.target.value)}
            placeholder="https://example.com/logo.png"
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Enter a URL to your logo image. This will be displayed in the admin sidebar.
          </p>
        </div>
        <div>
          <Label htmlFor="tagline">Tagline *</Label>
          <Input
            id="tagline"
            value={localData.tagline}
            onChange={(e) => onInputChange('tagline', e.target.value)}
            placeholder="What you do in a nutshell"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description">Site Description *</Label>
          <Textarea
            id="description"
            value={localData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="A brief description of your company"
            className="mt-1"
          />
        </div>
        <Button
          onClick={onSave}
          disabled={saving['siteName'] || saving['siteLogo'] || saving['tagline'] || saving['description']}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving['siteName'] || saving['siteLogo'] || saving['tagline'] || saving['description'] ? 'Saving...' : 'Save Basic Information'}
        </Button>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default BasicSiteInformation;
