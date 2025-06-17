
import React, { useState } from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Home, AlertCircle } from 'lucide-react';
import HeroImageUploader from '@/components/HeroImageUploader';
import { useHeroImageUpload } from '@/hooks/useHeroImageUpload';

interface HeroSectionSettingsProps {
  siteData: any;
  onInputChange: (field: string, value: string) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  hasUnsavedChanges?: boolean;
}

const HeroSectionSettings = ({ 
  siteData, 
  onInputChange, 
  onSave, 
  saving,
  hasUnsavedChanges = false 
}: HeroSectionSettingsProps) => {
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const { uploadHeroImage, deleteHeroImage, uploading } = useHeroImageUpload();

  const handleImageChange = (imageUrl: string | null) => {
    if (imageUrl && imageUrl.startsWith('blob:')) {
      // This is a preview URL from a file selection
      setPendingImageUrl(imageUrl);
      // Extract the file from the blob URL if needed - for now we'll handle this in save
    } else {
      // This is either null (remove) or a permanent URL
      setPendingImageUrl(imageUrl);
      onInputChange('heroBackgroundImage', imageUrl || '');
    }
  };

  const handleSave = async () => {
    try {
      // If there's a pending image file (blob URL), upload it first
      if (pendingImageUrl && pendingImageUrl.startsWith('blob:')) {
        // We need to get the file from the HeroImageUploader component
        // For now, let's handle the image upload in the save process
        console.log('Uploading new hero image...');
        
        // Convert blob URL to file and upload
        const response = await fetch(pendingImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'hero-image.jpg', { type: blob.type });
        
        const uploadedUrl = await uploadHeroImage(file);
        if (uploadedUrl) {
          onInputChange('heroBackgroundImage', uploadedUrl);
        }
      }
      
      // Save all hero settings
      await onSave();
      
      // Clear pending states on successful save
      setPendingImageFile(null);
      setPendingImageUrl(null);
    } catch (error) {
      console.error('Error saving hero settings:', error);
    }
  };

  const currentImageUrl = siteData.heroBackgroundImage || null;
  const displayImageUrl = pendingImageUrl || currentImageUrl;
  
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Home className="h-5 w-5 mr-2 text-purple-600" />
          Homepage Hero Section
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1 ml-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Customize the main hero section that visitors see first on your homepage
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

        <div>
          <HeroImageUploader
            currentImageUrl={currentImageUrl}
            onImageChange={handleImageChange}
            pendingImageUrl={pendingImageUrl}
            hasUnsavedChanges={!!pendingImageUrl || hasUnsavedChanges}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          onClick={handleSave}
          disabled={saving || uploading}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving || uploading ? 'Saving...' : 'Save Hero Settings'}
        </Button>

        {(hasUnsavedChanges || pendingImageUrl) && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                You have unsaved changes. Click "Save Hero Settings" to apply them.
              </p>
            </div>
          </div>
        )}
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default HeroSectionSettings;
