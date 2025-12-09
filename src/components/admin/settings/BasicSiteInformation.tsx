
import React, { useState } from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Globe } from 'lucide-react';
import AIGenerateButton from './AIGenerateButton';
import AIContentModal from './AIContentModal';
import SettingsLivePreview from './SettingsLivePreview';

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

const AI_PROMPTS = {
  tagline: {
    label: 'Tagline',
    prompt: 'Generate a compelling, memorable tagline for a vacation rental business. Keep it short (under 10 words), catchy, and convey the essence of unique travel experiences.',
  },
  description: {
    label: 'Site Description',
    prompt: 'Write a professional site description for a vacation rental company. It should be 2-3 sentences, highlighting unique value propositions and creating an inviting first impression.',
  },
};

const BasicSiteInformation = ({ localData, onInputChange, onSave, saving }: BasicSiteInformationProps) => {
  const [aiModal, setAiModal] = useState<{ open: boolean; field: keyof typeof AI_PROMPTS | null }>({
    open: false,
    field: null,
  });

  const openAiModal = (field: keyof typeof AI_PROMPTS) => {
    setAiModal({ open: true, field });
  };

  const handleApplyContent = (content: string) => {
    if (aiModal.field) {
      onInputChange(aiModal.field, content);
    }
  };

  return (
    <>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="tagline">Tagline *</Label>
              <AIGenerateButton 
                onClick={() => openAiModal('tagline')}
                tooltip="Generate tagline with AI"
              />
            </div>
            <Input
              id="tagline"
              value={localData.tagline}
              onChange={(e) => onInputChange('tagline', e.target.value)}
              placeholder="What you do in a nutshell"
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Site Description *</Label>
              <AIGenerateButton 
                onClick={() => openAiModal('description')}
                tooltip="Generate description with AI"
              />
            </div>
            <Textarea
              id="description"
              value={localData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="A brief description of your company"
              className="mt-1"
            />
          </div>
          <EnhancedButton
            onClick={onSave}
            disabled={saving['siteName'] || saving['siteLogo'] || saving['tagline'] || saving['description']}
            variant="gradient"
            loading={saving['siteName'] || saving['siteLogo'] || saving['tagline'] || saving['description']}
            className="w-full min-h-[44px] sm:min-h-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Basic Information
          </EnhancedButton>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* AI Generation Modal */}
      {aiModal.field && (
        <AIContentModal
          open={aiModal.open}
          onOpenChange={(open) => setAiModal({ ...aiModal, open })}
          fieldName={aiModal.field}
          fieldLabel={AI_PROMPTS[aiModal.field].label}
          contextPrompt={AI_PROMPTS[aiModal.field].prompt}
          currentValue={localData[aiModal.field]}
          onApply={handleApplyContent}
        />
      )}

      {/* Live Preview Panel */}
      <SettingsLivePreview section="basic" data={localData} />
    </>
  );
};

export default BasicSiteInformation;
