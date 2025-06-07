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
  const [seoData, setSeoData] = useState({
    siteTitle: 'Moxie Vacation Rentals',
    metaDescription: 'Your Home Base for Living Like a Local in Eugene - Discover Eugene, Oregon through thoughtfully curated vacation rentals.',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    favicon: ''
  });

  const [analyticsData, setAnalyticsData] = useState({
    googleAnalyticsId: '',
    googleTagManagerId: '',
    facebookPixelId: '',
    customHeaderScripts: '',
    customFooterScripts: '',
    customCss: ''
  });

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

  const handleSaveSeoSettings = async () => {
    const settingsToSave = [
      { key: 'siteTitle', value: seoData.siteTitle },
      { key: 'metaDescription', value: seoData.metaDescription },
      { key: 'ogTitle', value: seoData.ogTitle },
      { key: 'ogDescription', value: seoData.ogDescription },
      { key: 'ogImage', value: seoData.ogImage },
      { key: 'favicon', value: seoData.favicon },
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
        title: "SEO Settings Saved",
        description: "Your SEO and meta settings have been successfully updated.",
      });
    }
  };

  const handleSaveAnalyticsSettings = async () => {
    const settingsToSave = [
      { key: 'googleAnalyticsId', value: analyticsData.googleAnalyticsId },
      { key: 'googleTagManagerId', value: analyticsData.googleTagManagerId },
      { key: 'facebookPixelId', value: analyticsData.facebookPixelId },
      { key: 'customHeaderScripts', value: analyticsData.customHeaderScripts },
      { key: 'customFooterScripts', value: analyticsData.customFooterScripts },
      { key: 'customCss', value: analyticsData.customCss },
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
        title: "Analytics Settings Saved",
        description: "Your analytics and scripts have been successfully updated.",
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
      
      setSeoData({
        siteTitle: getSetting('siteTitle', 'Moxie Vacation Rentals'),
        metaDescription: getSetting('metaDescription', 'Your Home Base for Living Like a Local in Eugene - Discover Eugene, Oregon through thoughtfully curated vacation rentals.'),
        ogTitle: getSetting('ogTitle', ''),
        ogDescription: getSetting('ogDescription', ''),
        ogImage: getSetting('ogImage', ''),
        favicon: getSetting('favicon', '')
      });

      setAnalyticsData({
        googleAnalyticsId: getSetting('googleAnalyticsId', ''),
        googleTagManagerId: getSetting('googleTagManagerId', ''),
        facebookPixelId: getSetting('facebookPixelId', ''),
        customHeaderScripts: getSetting('customHeaderScripts', ''),
        customFooterScripts: getSetting('customFooterScripts', ''),
        customCss: getSetting('customCss', '')
      });
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
            <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO & Meta Tags</CardTitle>
                <CardDescription>
                  Control your site's search engine optimization and social media appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="siteTitle">Site Title (Browser Tab)</Label>
                  <Input
                    id="siteTitle"
                    value={seoData.siteTitle}
                    onChange={(e) => setSeoData(prev => ({ ...prev, siteTitle: e.target.value }))}
                    placeholder="Your site title"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={seoData.metaDescription}
                    onChange={(e) => setSeoData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Description for search engines"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="ogTitle">Open Graph Title (Social Media)</Label>
                  <Input
                    id="ogTitle"
                    value={seoData.ogTitle}
                    onChange={(e) => setSeoData(prev => ({ ...prev, ogTitle: e.target.value }))}
                    placeholder="Leave empty to use site title"
                  />
                </div>

                <div>
                  <Label htmlFor="ogDescription">Open Graph Description</Label>
                  <Textarea
                    id="ogDescription"
                    value={seoData.ogDescription}
                    onChange={(e) => setSeoData(prev => ({ ...prev, ogDescription: e.target.value }))}
                    placeholder="Leave empty to use meta description"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="ogImage">Open Graph Image URL</Label>
                  <Input
                    id="ogImage"
                    value={seoData.ogImage}
                    onChange={(e) => setSeoData(prev => ({ ...prev, ogImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input
                    id="favicon"
                    value={seoData.favicon}
                    onChange={(e) => setSeoData(prev => ({ ...prev, favicon: e.target.value }))}
                    placeholder="/lovable-uploads/your-favicon.png"
                  />
                </div>

                <Button onClick={handleSaveSeoSettings} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save SEO Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Custom Scripts</CardTitle>
                <CardDescription>
                  Add tracking codes and custom scripts to your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID (GA4)</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={analyticsData.googleAnalyticsId}
                    onChange={(e) => setAnalyticsData(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>

                <div>
                  <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
                  <Input
                    id="googleTagManagerId"
                    value={analyticsData.googleTagManagerId}
                    onChange={(e) => setAnalyticsData(prev => ({ ...prev, googleTagManagerId: e.target.value }))}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>

                <div>
                  <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixelId"
                    value={analyticsData.facebookPixelId}
                    onChange={(e) => setAnalyticsData(prev => ({ ...prev, facebookPixelId: e.target.value }))}
                    placeholder="123456789012345"
                  />
                </div>

                <div>
                  <Label htmlFor="customHeaderScripts">Custom Header Scripts</Label>
                  <Textarea
                    id="customHeaderScripts"
                    value={analyticsData.customHeaderScripts}
                    onChange={(e) => setAnalyticsData(prev => ({ ...prev, customHeaderScripts: e.target.value }))}
                    placeholder="JavaScript code to be added before </head>"
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="customFooterScripts">Custom Footer Scripts</Label>
                  <Textarea
                    id="customFooterScripts"
                    value={analyticsData.customFooterScripts}
                    onChange={(e) => setAnalyticsData(prev => ({ ...prev, customFooterScripts: e.target.value }))}
                    placeholder="JavaScript code to be added before </body>"
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="customCss">Custom CSS</Label>
                  <Textarea
                    id="customCss"
                    value={analyticsData.customCss}
                    onChange={(e) => setAnalyticsData(prev => ({ ...prev, customCss: e.target.value }))}
                    placeholder="Custom CSS styles"
                    rows={4}
                    className="font-mono text-sm"
                  />
                </div>

                <Button onClick={handleSaveAnalyticsSettings} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Analytics Settings
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
