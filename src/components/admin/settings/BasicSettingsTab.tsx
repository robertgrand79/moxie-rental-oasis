
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Globe, Home, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BasicSettingsTabProps {
  siteData: any;
  setSiteData: (data: any) => void;
  updateSetting: (key: string, value: any) => Promise<boolean>;
}

const BasicSettingsTab = ({ siteData, setSiteData, updateSetting }: BasicSettingsTabProps) => {
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setSiteData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSiteData((prev: any) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSaveBasicSettings = async () => {
    const settingsToSave = [
      { key: 'siteName', value: siteData.siteName },
      { key: 'tagline', value: siteData.tagline },
      { key: 'description', value: siteData.description },
      { key: 'contactEmail', value: siteData.contactEmail },
      { key: 'phone', value: siteData.phone },
      { key: 'address', value: siteData.address },
    ];

    let allSuccessful = true;
    for (const setting of settingsToSave) {
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
      }
    }

    if (allSuccessful) {
      toast({
        title: "Basic Settings Saved",
        description: "Your site information has been successfully updated.",
      });
    }
  };

  const handleSaveHeroSettings = async () => {
    const settingsToSave = [
      { key: 'heroTitle', value: siteData.heroTitle },
      { key: 'heroSubtitle', value: siteData.heroSubtitle },
      { key: 'heroDescription', value: siteData.heroDescription },
      { key: 'heroBackgroundImage', value: siteData.heroBackgroundImage },
      { key: 'heroLocationText', value: siteData.heroLocationText },
      { key: 'heroRating', value: siteData.heroRating },
      { key: 'heroCTAText', value: siteData.heroCTAText },
    ];

    let allSuccessful = true;
    for (const setting of settingsToSave) {
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
      }
    }

    if (allSuccessful) {
      toast({
        title: "Hero Settings Saved",
        description: "Your homepage hero section has been successfully updated.",
      });
    }
  };

  const handleSaveSocialSettings = async () => {
    const success = await updateSetting('socialMedia', siteData.socialMedia);
    if (success) {
      toast({
        title: "Social Media Settings Saved",
        description: "Your social media links have been successfully updated.",
      });
    }
  };

  // Calculate completion status
  const isBasicComplete = siteData.siteName && siteData.tagline && siteData.description && siteData.contactEmail;
  const isHeroComplete = siteData.heroTitle && siteData.heroSubtitle && siteData.heroDescription;
  const isSocialComplete = Object.values(siteData.socialMedia).some((url: any) => url?.trim());

  return (
    <div className="space-y-8">
      {/* Quick Setup Progress */}
      <EnhancedCard variant="glass" className="border-l-4 border-l-blue-500">
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center text-blue-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            Quick Setup Progress
          </EnhancedCardTitle>
          <EnhancedCardDescription>
            Complete these essential settings to get your site ready
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${isBasicComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Basic Info</span>
                {isBasicComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
              </div>
              <p className="text-sm text-gray-600 mt-1">Site name, description, contact</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${isHeroComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Hero Section</span>
                {isHeroComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
              </div>
              <p className="text-sm text-gray-600 mt-1">Homepage main content</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${isSocialComplete ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">Social Links</span>
                {isSocialComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
              </div>
              <p className="text-sm text-gray-600 mt-1">Connect social media</p>
            </div>
          </div>
        </EnhancedCardContent>
      </EnhancedCard>

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
                value={siteData.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Your site name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline *</Label>
              <Input
                id="tagline"
                value={siteData.tagline}
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
              value={siteData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your business and what makes it special"
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">This appears in search results and social media previews</p>
          </div>

          <Button onClick={handleSaveBasicSettings} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save General Information
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
                value={siteData.heroTitle}
                onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                placeholder="Your main headline"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Input
                id="heroSubtitle"
                value={siteData.heroSubtitle}
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
              value={siteData.heroDescription}
              onChange={(e) => handleInputChange('heroDescription', e.target.value)}
              placeholder="Compelling description that encourages visitors to explore"
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="heroBackgroundImage">Background Image URL</Label>
            <Input
              id="heroBackgroundImage"
              value={siteData.heroBackgroundImage}
              onChange={(e) => handleInputChange('heroBackgroundImage', e.target.value)}
              placeholder="https://example.com/beautiful-image.jpg"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Use high-quality images (1920x1080 or larger) for best results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="heroLocationText">Location Text</Label>
              <Input
                id="heroLocationText"
                value={siteData.heroLocationText}
                onChange={(e) => handleInputChange('heroLocationText', e.target.value)}
                placeholder="Eugene, Oregon"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heroRating">Rating</Label>
              <Input
                id="heroRating"
                value={siteData.heroRating}
                onChange={(e) => handleInputChange('heroRating', e.target.value)}
                placeholder="4.9"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="heroCTAText">Button Text</Label>
              <Input
                id="heroCTAText"
                value={siteData.heroCTAText}
                onChange={(e) => handleInputChange('heroCTAText', e.target.value)}
                placeholder="View Properties"
                className="mt-1"
              />
            </div>
          </div>

          <Button onClick={handleSaveHeroSettings} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Hero Settings
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
                value={siteData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@yoursite.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={siteData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                value={siteData.address}
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
                  value={siteData.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={siteData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/youraccount"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={siteData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/youraccount"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="googlePlaces">Google Places URL</Label>
                <Input
                  id="googlePlaces"
                  value={siteData.socialMedia.googlePlaces}
                  onChange={(e) => handleSocialMediaChange('googlePlaces', e.target.value)}
                  placeholder="https://maps.google.com/yourplace"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSocialSettings} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Contact & Social Settings
          </Button>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};

export default BasicSettingsTab;
