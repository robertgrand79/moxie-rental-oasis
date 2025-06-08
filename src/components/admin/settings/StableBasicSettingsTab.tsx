import React, { useState } from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Globe, Home, Mail } from 'lucide-react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import HeroImageUploader from '@/components/HeroImageUploader';

const StableBasicSettingsTab = () => {
  const { settings, saving, updateSettingOptimistic, saveSettings } = useStableSiteSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local state when settings change
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
    // Optimistic update
    updateSettingOptimistic({ [field]: value } as any);
  };

  const handleImageChange = (imageUrl: string | null) => {
    const newImageUrl = imageUrl || '';
    setLocalSettings(prev => ({
      ...prev,
      heroBackgroundImage: newImageUrl
    }));
    updateSettingOptimistic({ heroBackgroundImage: newImageUrl });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    const newSocialMedia = {
      ...localSettings.socialMedia,
      [platform]: value
    };
    setLocalSettings(prev => ({
      ...prev,
      socialMedia: newSocialMedia
    }));
    updateSettingOptimistic({ socialMedia: newSocialMedia });
  };

  const handleSaveBasicInfo = async () => {
    await saveSettings({
      siteName: localSettings.siteName,
      tagline: localSettings.tagline,
      description: localSettings.description
    });
  };

  const handleSaveHeroSettings = async () => {
    await saveSettings({
      heroTitle: localSettings.heroTitle,
      heroSubtitle: localSettings.heroSubtitle,
      heroDescription: localSettings.heroDescription,
      heroBackgroundImage: localSettings.heroBackgroundImage,
      heroLocationText: localSettings.heroLocationText,
      heroRating: localSettings.heroRating,
      heroCTAText: localSettings.heroCTAText
    });
  };

  const handleSaveContactInfo = async () => {
    await saveSettings({
      contactEmail: localSettings.contactEmail,
      phone: localSettings.phone,
      address: localSettings.address,
      socialMedia: localSettings.socialMedia
    });
  };

  return (
    <div className="space-y-8">
      {/* General Information */}
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
                value={localSettings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Your site name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline *</Label>
              <Input
                id="tagline"
                value={localSettings.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="A short, memorable tagline"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Site Description *</Label>
            <Textarea
              id="description"
              value={localSettings.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your business and what makes it special"
              rows={3}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleSaveBasicInfo} 
            disabled={saving.siteName || saving.tagline || saving.description}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving.siteName || saving.tagline || saving.description ? 'Saving...' : 'Save General Information'}
          </Button>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Hero Section */}
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
                value={localSettings.heroTitle}
                onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                placeholder="Your main headline"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Input
                id="heroSubtitle"
                value={localSettings.heroSubtitle}
                onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                placeholder="Supporting text"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="heroDescription">Hero Description *</Label>
            <Textarea
              id="heroDescription"
              value={localSettings.heroDescription}
              onChange={(e) => handleInputChange('heroDescription', e.target.value)}
              placeholder="Compelling description that encourages visitors to explore"
              rows={3}
              className="mt-1"
            />
          </div>

          <HeroImageUploader
            currentImageUrl={localSettings.heroBackgroundImage || null}
            onImageChange={handleImageChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="heroLocationText">Location Text</Label>
              <Input
                id="heroLocationText"
                value={localSettings.heroLocationText}
                onChange={(e) => handleInputChange('heroLocationText', e.target.value)}
                placeholder="Eugene, Oregon"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heroRating">Rating</Label>
              <Input
                id="heroRating"
                value={localSettings.heroRating}
                onChange={(e) => handleInputChange('heroRating', e.target.value)}
                placeholder="4.9"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heroCTAText">Button Text</Label>
              <Input
                id="heroCTAText"
                value={localSettings.heroCTAText}
                onChange={(e) => handleInputChange('heroCTAText', e.target.value)}
                placeholder="View Properties"
                className="mt-1"
              />
            </div>
          </div>

          <Button 
            onClick={handleSaveHeroSettings}
            disabled={Object.keys(saving).some(key => key.startsWith('hero') && saving[key])}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {Object.keys(saving).some(key => key.startsWith('hero') && saving[key]) ? 'Saving...' : 'Save Hero Settings'}
          </Button>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Contact Information */}
      <EnhancedCard variant="glass">
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-green-600" />
            Contact Information
          </EnhancedCardTitle>
          <EnhancedCardDescription>
            Configure your business contact details and social media presence
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={localSettings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@yoursite.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={localSettings.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                value={localSettings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main St, City, State"
                className="mt-1"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Social Media Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  value={localSettings.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={localSettings.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/youraccount"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={localSettings.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/youraccount"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="googlePlaces">Google Places URL</Label>
                <Input
                  id="googlePlaces"
                  value={localSettings.socialMedia.googlePlaces}
                  onChange={(e) => handleSocialMediaChange('googlePlaces', e.target.value)}
                  placeholder="https://maps.google.com/yourplace"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSaveContactInfo}
            disabled={saving.contactEmail || saving.phone || saving.address || saving.socialMedia}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {(saving.contactEmail || saving.phone || saving.address || saving.socialMedia) ? 'Saving...' : 'Save Contact Information'}
          </Button>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};

export default StableBasicSettingsTab;
