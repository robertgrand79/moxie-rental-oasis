import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Globe, Image, AlertCircle } from 'lucide-react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useBasicSettingsSave } from '@/hooks/useBasicSettingsSave';
import ImageUploader from '@/components/admin/ImageUploader';
import StaticSettingsSyncButton from './StaticSettingsSyncButton';

const StableBasicSettingsTab = () => {
  const { settings, saving, updateSettingOptimistic, saveSetting } = useSimplifiedSiteSettings();
  
  const [localData, setLocalData] = React.useState({
    siteName: settings.siteName || '',
    tagline: settings.tagline || '',
    description: settings.description || '',
    heroTitle: settings.heroTitle || '',
    heroSubtitle: settings.heroSubtitle || '',
    heroDescription: settings.heroDescription || '',
    heroBackgroundImage: settings.heroBackgroundImage || '',
    heroLocationText: settings.heroLocationText || '',
    heroRating: settings.heroRating || '',
    heroCTAText: settings.heroCTAText || '',
    contactEmail: settings.contactEmail || '',
    phone: settings.phone || '',
    address: settings.address || '',
    socialMedia: settings.socialMedia || {
      facebook: '',
      instagram: '',
      twitter: '',
      googlePlaces: ''
    }
  });

  React.useEffect(() => {
    setLocalData({
      siteName: settings.siteName || '',
      tagline: settings.tagline || '',
      description: settings.description || '',
      heroTitle: settings.heroTitle || '',
      heroSubtitle: settings.heroSubtitle || '',
      heroDescription: settings.heroDescription || '',
      heroBackgroundImage: settings.heroBackgroundImage || '',
      heroLocationText: settings.heroLocationText || '',
      heroRating: settings.heroRating || '',
      heroCTAText: settings.heroCTAText || '',
      contactEmail: settings.contactEmail || '',
      phone: settings.phone || '',
      address: settings.address || '',
      socialMedia: settings.socialMedia || {
        facebook: '',
        instagram: '',
        twitter: '',
        googlePlaces: ''
      }
    });
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
    updateSettingOptimistic({ [field]: value } as any);
  };

  const { handleSaveBasicSettings, handleSaveHeroSettings, handleSaveContactSettings } = useBasicSettingsSave({
    siteData: localData,
    updateSetting: saveSetting
  });

  return (
    <div className="space-y-8">
      {/* Static Settings Sync Section */}
      <StaticSettingsSyncButton />

      {/* Basic Site Information */}
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
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              placeholder="Your Company Name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline *</Label>
            <Input
              id="tagline"
              value={localData.tagline}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              placeholder="What you do in a nutshell"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Site Description *</Label>
            <Textarea
              id="description"
              value={localData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="A brief description of your company"
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleSaveBasicSettings}
            disabled={saving['siteName'] || saving['tagline'] || saving['description']}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving['siteName'] || saving['tagline'] || saving['description'] ? 'Saving...' : 'Save Basic Information'}
          </Button>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Hero Section Settings */}
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
              onChange={(e) => handleInputChange('heroTitle', e.target.value)}
              placeholder="Your Main Headline"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
            <Input
              id="heroSubtitle"
              value={localData.heroSubtitle}
              onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
              placeholder="A Catchy Subtitle"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="heroDescription">Hero Description *</Label>
            <Textarea
              id="heroDescription"
              value={localData.heroDescription}
              onChange={(e) => handleInputChange('heroDescription', e.target.value)}
              placeholder="Describe what makes you special"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="heroBackgroundImage">Hero Background Image</Label>
            <ImageUploader
              imageUrl={localData.heroBackgroundImage}
              onImageUpload={(url) => handleInputChange('heroBackgroundImage', url)}
              onImageRemove={() => handleInputChange('heroBackgroundImage', '')}
            />
          </div>
          <div>
            <Label htmlFor="heroLocationText">Hero Location Text</Label>
            <Input
              id="heroLocationText"
              value={localData.heroLocationText}
              onChange={(e) => handleInputChange('heroLocationText', e.target.value)}
              placeholder="Location"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="heroRating">Hero Rating</Label>
            <Input
              id="heroRating"
              value={localData.heroRating}
              onChange={(e) => handleInputChange('heroRating', e.target.value)}
              placeholder="4.9"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="heroCTAText">Hero CTA Text</Label>
            <Input
              id="heroCTAText"
              value={localData.heroCTAText}
              onChange={(e) => handleInputChange('heroCTAText', e.target.value)}
              placeholder="Call to Action"
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleSaveHeroSettings}
            disabled={saving['heroTitle'] || saving['heroDescription'] || saving['heroBackgroundImage']}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving['heroTitle'] || saving['heroDescription'] || saving['heroBackgroundImage'] ? 'Saving...' : 'Save Hero Section'}
          </Button>
        </EnhancedCardContent>
      </EnhancedCard>

      {/* Contact Information */}
      <EnhancedCard variant="glass">
        <EnhancedCardHeader>
          <EnhancedCardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-purple-600" />
            Contact Information
          </EnhancedCardTitle>
          <EnhancedCardDescription>
            Manage your site's contact details
          </EnhancedCardDescription>
        </EnhancedCardHeader>
        <EnhancedCardContent className="space-y-6">
          <div>
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              value={localData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              placeholder="contact@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={localData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={localData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main St, Anytown, USA"
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleSaveContactSettings}
            disabled={saving['contactEmail'] || saving['phone'] || saving['address']}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving['contactEmail'] || saving['phone'] || saving['address'] ? 'Saving...' : 'Save Contact Information'}
          </Button>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};

export default StableBasicSettingsTab;
