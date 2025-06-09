
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import HeroImageUploader from '@/components/HeroImageUploader';

interface HeroSettingsTabProps {
  siteData: {
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
}

const HeroSettingsTab = ({ siteData, onInputChange, onSave }: HeroSettingsTabProps) => {
  const handleImageChange = (imageUrl: string | null) => {
    onInputChange('heroBackgroundImage', imageUrl || '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section Settings</CardTitle>
        <CardDescription>
          Customize the main hero section that appears on your homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="heroTitle">Hero Title</Label>
            <Input
              id="heroTitle"
              value={siteData.heroTitle}
              onChange={(e) => onInputChange('heroTitle', e.target.value)}
              placeholder="Main headline"
            />
          </div>
          <div>
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Input
              id="heroSubtitle"
              value={siteData.heroSubtitle}
              onChange={(e) => onInputChange('heroSubtitle', e.target.value)}
              placeholder="Supporting text"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="heroDescription">Hero Description</Label>
          <Textarea
            id="heroDescription"
            value={siteData.heroDescription}
            onChange={(e) => onInputChange('heroDescription', e.target.value)}
            placeholder="Descriptive text under the main headline"
            rows={3}
          />
        </div>

        <HeroImageUploader
          currentImageUrl={siteData.heroBackgroundImage || null}
          onImageChange={handleImageChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="heroLocationText">Location Text</Label>
            <Input
              id="heroLocationText"
              value={siteData.heroLocationText}
              onChange={(e) => onInputChange('heroLocationText', e.target.value)}
              placeholder="Eugene, Oregon"
            />
          </div>
          <div>
            <Label htmlFor="heroRating">Rating</Label>
            <Input
              id="heroRating"
              value={siteData.heroRating}
              onChange={(e) => onInputChange('heroRating', e.target.value)}
              placeholder="4.9"
            />
          </div>
          <div>
            <Label htmlFor="heroCTAText">Call-to-Action Button Text</Label>
            <Input
              id="heroCTAText"
              value={siteData.heroCTAText}
              onChange={(e) => onInputChange('heroCTAText', e.target.value)}
              placeholder="View Properties"
            />
          </div>
        </div>

        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Hero Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default HeroSettingsTab;
