
import React, { useState } from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Image } from 'lucide-react';
import HeroImageUploader from '@/components/HeroImageUploader';
import AIGenerateButton from './AIGenerateButton';
import AIContentModal from './AIContentModal';
import SettingsLivePreview from './SettingsLivePreview';

interface HeroSectionSettingsProps {
  localData: {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroBackgroundImage: string;
    heroLocationText: string;
    heroCTAText: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
  saving: Record<string, boolean>;
}

const AI_PROMPTS = {
  heroTitle: {
    label: 'Hero Title',
    prompt: 'Generate a powerful, attention-grabbing hero headline for a vacation rental website. It should be 5-8 words, evoke emotion, and inspire wanderlust.',
  },
  heroSubtitle: {
    label: 'Hero Subtitle',
    prompt: 'Create a compelling subtitle to complement a vacation rental hero section. Keep it under 15 words, supportive of the main headline, and highlighting key benefits.',
  },
  heroDescription: {
    label: 'Hero Description',
    prompt: 'Write an engaging hero section description for a vacation rental site. 2-3 sentences that paint a picture of the experience and encourage visitors to explore further.',
  },
  heroCTAText: {
    label: 'Call to Action',
    prompt: 'Generate a compelling call-to-action button text for a vacation rental booking site. Should be 2-4 words, action-oriented, and create urgency.',
  },
};

type AIPromptField = keyof typeof AI_PROMPTS;

const HeroSectionSettings = ({ localData, onInputChange, onSave, saving }: HeroSectionSettingsProps) => {
  const [aiModal, setAiModal] = useState<{ open: boolean; field: AIPromptField | null }>({
    open: false,
    field: null,
  });

  const openAiModal = (field: AIPromptField) => {
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
            <Image className="h-5 w-5 mr-2 text-green-600" />
            Hero Section Settings
          </EnhancedCardTitle>
          <EnhancedCardDescription>
            Customize the main hero section of your landing page
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="heroTitle">Hero Title *</Label>
              <AIGenerateButton 
                onClick={() => openAiModal('heroTitle')}
                tooltip="Generate title with AI"
              />
            </div>
            <Input
              id="heroTitle"
              value={localData.heroTitle}
              onChange={(e) => onInputChange('heroTitle', e.target.value)}
              placeholder="Your Main Headline"
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <AIGenerateButton 
                onClick={() => openAiModal('heroSubtitle')}
                tooltip="Generate subtitle with AI"
              />
            </div>
            <Input
              id="heroSubtitle"
              value={localData.heroSubtitle}
              onChange={(e) => onInputChange('heroSubtitle', e.target.value)}
              placeholder="A Catchy Subtitle"
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="heroDescription">Hero Description *</Label>
              <AIGenerateButton 
                onClick={() => openAiModal('heroDescription')}
                tooltip="Generate description with AI"
              />
            </div>
            <Textarea
              id="heroDescription"
              value={localData.heroDescription}
              onChange={(e) => onInputChange('heroDescription', e.target.value)}
              placeholder="Describe what makes you special"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="heroBackgroundImage">Hero Background Image</Label>
            <HeroImageUploader
              currentImageUrl={localData.heroBackgroundImage}
              onImageChange={(url) => onInputChange('heroBackgroundImage', url || '')}
            />
          </div>
          <div>
            <Label htmlFor="heroLocationText">Hero Location Text</Label>
            <Input
              id="heroLocationText"
              value={localData.heroLocationText}
              onChange={(e) => onInputChange('heroLocationText', e.target.value)}
              placeholder="Location"
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="heroCTAText">Hero CTA Text</Label>
              <AIGenerateButton 
                onClick={() => openAiModal('heroCTAText')}
                tooltip="Generate CTA with AI"
              />
            </div>
            <Input
              id="heroCTAText"
              value={localData.heroCTAText}
              onChange={(e) => onInputChange('heroCTAText', e.target.value)}
              placeholder="Call to Action"
              className="mt-1"
            />
          </div>
          <EnhancedButton
            onClick={onSave}
            disabled={saving['heroTitle'] || saving['heroDescription'] || saving['heroBackgroundImage']}
            variant="gradient"
            loading={saving['heroTitle'] || saving['heroDescription'] || saving['heroBackgroundImage']}
            className="w-full min-h-[44px] sm:min-h-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Hero Section
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
      <SettingsLivePreview section="hero" data={localData} />
    </>
  );
};

export default HeroSectionSettings;
