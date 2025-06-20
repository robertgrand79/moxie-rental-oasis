
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Image } from 'lucide-react';
import HeroImageUploader from '@/components/HeroImageUploader';

interface HeroSectionSettingsProps {
  localData: {
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroBackgroundImage: string;
    heroLocationText: string;
    heroRating: string;
    heroCTAText: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
  saving: Record<string, boolean>;
}

const HeroSectionSettings = ({ localData, onInputChange, onSave, saving }: HeroSectionSettingsProps) => {
  return (
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
          <Label htmlFor="heroTitle">Hero Title *</Label>
          <Input
            id="heroTitle"
            value={localData.heroTitle}
            onChange={(e) => onInputChange('heroTitle', e.target.value)}
            placeholder="Your Main Headline"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
          <Input
            id="heroSubtitle"
            value={localData.heroSubtitle}
            onChange={(e) => onInputChange('heroSubtitle', e.target.value)}
            placeholder="A Catchy Subtitle"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="heroDescription">Hero Description *</Label>
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
          <Label htmlFor="heroRating">Hero Rating</Label>
          <Input
            id="heroRating"
            value={localData.heroRating}
            onChange={(e) => onInputChange('heroRating', e.target.value)}
            placeholder="4.9"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="heroCTAText">Hero CTA Text</Label>
          <Input
            id="heroCTAText"
            value={localData.heroCTAText}
            onChange={(e) => onInputChange('heroCTAText', e.target.value)}
            placeholder="Call to Action"
            className="mt-1"
          />
        </div>
        <Button
          onClick={onSave}
          disabled={saving['heroTitle'] || saving['heroDescription'] || saving['heroBackgroundImage']}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving['heroTitle'] || saving['heroDescription'] || saving['heroBackgroundImage'] ? 'Saving...' : 'Save Hero Section'}
        </Button>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default HeroSectionSettings;
