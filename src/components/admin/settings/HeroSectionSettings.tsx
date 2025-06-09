
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Home } from 'lucide-react';
import HeroImageUploader from '@/components/HeroImageUploader';

interface HeroSectionSettingsProps {
  siteData: any;
  onInputChange: (field: string, value: string) => void;
  onImageChange: (imageUrl: string | null) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

const HeroSectionSettings = ({ siteData, onInputChange, onImageChange, onSave, saving }: HeroSectionSettingsProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Home className="h-5 w-5 mr-2 text-purple-600" />
          Homepage Hero Section
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Customize the main hero section that visitors see first
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="heroTitle">Hero Title *</Label>
            <Input
              id="heroTitle"
              value={siteData.heroTitle}
              onChange={(e) => onInputChange('heroTitle', e.target.value)}
              placeholder="Your main headline"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Input
              id="heroSubtitle"
              value={siteData.heroSubtitle}
              onChange={(e) => onInputChange('heroSubtitle', e.target.value)}
              placeholder="Supporting text"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="heroDescription">Hero Description *</Label>
          <Textarea
            id="heroDescription"
            value={siteData.heroDescription}
            onChange={(e) => onInputChange('heroDescription', e.target.value)}
            placeholder="Compelling description that encourages visitors to explore"
            rows={3}
            className="mt-1"
          />
        </div>

        <HeroImageUploader
          currentImageUrl={siteData.heroBackgroundImage || null}
          onImageChange={onImageChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="heroLocationText">Location Text</Label>
            <Input
              id="heroLocationText"
              value={siteData.heroLocationText}
              onChange={(e) => onInputChange('heroLocationText', e.target.value)}
              placeholder="Eugene, Oregon"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="heroRating">Rating</Label>
            <Input
              id="heroRating"
              value={siteData.heroRating}
              onChange={(e) => onInputChange('heroRating', e.target.value)}
              placeholder="4.9"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="heroCTAText">Button Text</Label>
            <Input
              id="heroCTAText"
              value={siteData.heroCTAText}
              onChange={(e) => onInputChange('heroCTAText', e.target.value)}
              placeholder="View Properties"
              className="mt-1"
            />
          </div>
        </div>

        <Button 
          onClick={onSave}
          disabled={saving}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Hero Settings'}
        </Button>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default HeroSectionSettings;
