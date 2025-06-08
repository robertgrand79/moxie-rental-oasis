
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Globe, Home, Mail } from 'lucide-react';
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

  return (
    <div className="grid gap-6">
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
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={siteData.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Your site name"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={siteData.tagline}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="A short tagline"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Site Description</Label>
            <Textarea
              id="description"
              value={siteData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your business"
              rows={3}
            />
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
            Customize the main hero section that appears on your homepage
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input
                id="heroTitle"
                value={siteData.heroTitle}
                onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                placeholder="Main headline"
              />
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Input
                id="heroSubtitle"
                value={siteData.heroSubtitle}
                onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                placeholder="Supporting text"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="heroDescription">Hero Description</Label>
            <Textarea
              id="heroDescription"
              value={siteData.heroDescription}
              onChange={(e) => handleInputChange('heroDescription', e.target.value)}
              placeholder="Descriptive text under the main headline"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="heroBackgroundImage">Background Image URL</Label>
            <Input
              id="heroBackgroundImage"
              value={siteData.heroBackgroundImage}
              onChange={(e) => handleInputChange('heroBackgroundImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="heroLocationText">Location Text</Label>
              <Input
                id="heroLocationText"
                value={siteData.heroLocationText}
                onChange={(e) => handleInputChange('heroLocationText', e.target.value)}
                placeholder="Eugene, Oregon"
              />
            </div>
            <div>
              <Label htmlFor="heroRating">Rating</Label>
              <Input
                id="heroRating"
                value={siteData.heroRating}
                onChange={(e) => handleInputChange('heroRating', e.target.value)}
                placeholder="4.9"
              />
            </div>
            <div>
              <Label htmlFor="heroCTAText">Call-to-Action Button Text</Label>
              <Input
                id="heroCTAText"
                value={siteData.heroCTAText}
                onChange={(e) => handleInputChange('heroCTAText', e.target.value)}
                placeholder="View Properties"
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
            Configure your business contact details and social media links
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={siteData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="contact@yoursite.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={siteData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={siteData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Your business address"
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
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  value={siteData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/youraccount"
                />
              </div>
              <div>
                <Label htmlFor="twitter">Twitter URL</Label>
                <Input
                  id="twitter"
                  value={siteData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/youraccount"
                />
              </div>
              <div>
                <Label htmlFor="googlePlaces">Google Places URL</Label>
                <Input
                  id="googlePlaces"
                  value={siteData.socialMedia.googlePlaces}
                  onChange={(e) => handleSocialMediaChange('googlePlaces', e.target.value)}
                  placeholder="https://maps.google.com/yourplace"
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
