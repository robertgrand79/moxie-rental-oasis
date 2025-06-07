import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Palette, Type, Image, Wand2, Save, Share, MapPin } from 'lucide-react';
import ColorCustomizer from '@/components/ColorCustomizer';
import FontCustomizer from '@/components/FontCustomizer';
import LogoUploader from '@/components/LogoUploader';
import AISiteEditor from '@/components/AISiteEditor';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const SiteSettings = () => {
  const { settings, loading, updateSetting, getSetting } = useSiteSettings();
  const { toast } = useToast();

  const [siteData, setSiteData] = useState({
    siteName: 'Moxie Vacation Rentals',
    tagline: 'Your perfect getaway is just a click away.',
    description: 'Discover amazing vacation rental properties in prime locations.',
    heroTitle: 'Welcome to Moxie Vacation Rentals',
    heroSubtitle: 'Discover amazing vacation rental properties in prime locations. Your perfect getaway is just a click away.',
    contactEmail: 'contact@moxievacationrentals.com',
    phone: '+1 (555) 123-4567',
    address: '123 Vacation St, Resort City, RC 12345',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      googlePlaces: ''
    }
  });

  const [mapboxToken, setMapboxToken] = useState('');

  const handleSaveSettings = async () => {
    const settingsToSave = [
      { key: 'siteName', value: siteData.siteName },
      { key: 'tagline', value: siteData.tagline },
      { key: 'description', value: siteData.description },
      { key: 'heroTitle', value: siteData.heroTitle },
      { key: 'heroSubtitle', value: siteData.heroSubtitle },
      { key: 'contactEmail', value: siteData.contactEmail },
      { key: 'phone', value: siteData.phone },
      { key: 'address', value: siteData.address },
      { key: 'socialMedia', value: siteData.socialMedia },
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
        title: "Settings Saved",
        description: "Your site settings have been successfully updated.",
      });
    }
  };

  const handleSaveMapboxToken = async () => {
    const success = await updateSetting('mapboxToken', mapboxToken);
    if (success) {
      toast({
        title: "Mapbox Token Saved",
        description: "Your Mapbox token has been successfully updated.",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSiteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSiteData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  useEffect(() => {
    if (!loading && Object.keys(settings).length > 0) {
      setSiteData({
        siteName: getSetting('siteName', 'Moxie Vacation Rentals'),
        tagline: getSetting('tagline', 'Your perfect getaway is just a click away.'),
        description: getSetting('description', 'Discover amazing vacation rental properties in prime locations.'),
        heroTitle: getSetting('heroTitle', 'Welcome to Moxie Vacation Rentals'),
        heroSubtitle: getSetting('heroSubtitle', 'Discover amazing vacation rental properties in prime locations. Your perfect getaway is just a click away.'),
        contactEmail: getSetting('contactEmail', 'contact@moxievacationrentals.com'),
        phone: getSetting('phone', '+1 (555) 123-4567'),
        address: getSetting('address', '123 Vacation St, Resort City, RC 12345'),
        socialMedia: getSetting('socialMedia', {
          facebook: '',
          instagram: '',
          twitter: '',
          googlePlaces: ''
        })
      });
      setMapboxToken(getSetting('mapboxToken', ''));
    }
  }, [loading, settings, getSetting]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <p className="text-gray-600">Loading site settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Settings</h1>
          <p className="text-gray-600">
            Customize your website's appearance, content, and branding
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="social">
              <Share className="h-4 w-4 mr-1" />
              Social
            </TabsTrigger>
            <TabsTrigger value="maps">
              <MapPin className="h-4 w-4 mr-1" />
              Maps
            </TabsTrigger>
            <TabsTrigger value="colors">
              <Palette className="h-4 w-4 mr-1" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="fonts">
              <Type className="h-4 w-4 mr-1" />
              Fonts
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Image className="h-4 w-4 mr-1" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="ai-editor">
              <Wand2 className="h-4 w-4 mr-1" />
              AI Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure your site's basic information and content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                <div>
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={siteData.heroTitle}
                    onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                    placeholder="Main headline on homepage"
                  />
                </div>

                <div>
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={siteData.heroSubtitle}
                    onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                    placeholder="Supporting text for the main headline"
                    rows={2}
                  />
                </div>

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

                <Button onClick={handleSaveSettings} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Configure your social media URLs that will appear in the footer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
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

                <Button onClick={handleSaveSettings} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Social Media Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maps">
            <Card>
              <CardHeader>
                <CardTitle>Maps Configuration</CardTitle>
                <CardDescription>
                  Configure your Mapbox token for displaying property locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">About Mapbox Token</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    A Mapbox public token is required to display interactive maps with property locations. 
                    This token is safe to use in frontend applications and allows your visitors to view property locations.
                  </p>
                  <p className="text-sm text-blue-700">
                    Get your free token at{' '}
                    <a 
                      href="https://mapbox.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline hover:text-blue-900"
                    >
                      mapbox.com
                    </a>
                    {' '}(look for "Access tokens" in your account dashboard)
                  </p>
                </div>

                <div>
                  <Label htmlFor="mapboxToken">Mapbox Public Token</Label>
                  <Input
                    id="mapboxToken"
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                    placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Public tokens start with "pk." and are safe to use in web applications
                  </p>
                </div>

                {mapboxToken && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-green-800">
                      ✓ Token configured. Maps will now display on your property listings page.
                    </p>
                  </div>
                )}

                <Button onClick={handleSaveMapboxToken} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Mapbox Token
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors">
            <ColorCustomizer />
          </TabsContent>

          <TabsContent value="fonts">
            <FontCustomizer />
          </TabsContent>

          <TabsContent value="branding">
            <LogoUploader />
          </TabsContent>

          <TabsContent value="ai-editor">
            <AISiteEditor siteData={siteData} onUpdateSiteData={setSiteData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteSettings;
