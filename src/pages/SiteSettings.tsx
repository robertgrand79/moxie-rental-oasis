
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Palette, Type, Image, Wand2, Share, MapPin, Calendar, Camera, Star } from 'lucide-react';
import ColorCustomizer from '@/components/ColorCustomizer';
import FontCustomizer from '@/components/FontCustomizer';
import LogoUploader from '@/components/LogoUploader';
import AISiteEditor from '@/components/AISiteEditor';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import GeneralSettingsTab from '@/components/admin/settings/GeneralSettingsTab';
import HeroSettingsTab from '@/components/admin/settings/HeroSettingsTab';
import SocialSettingsTab from '@/components/admin/settings/SocialSettingsTab';
import SEOSettingsTab from '@/components/admin/settings/SEOSettingsTab';
import AnalyticsSettingsTab from '@/components/admin/settings/AnalyticsSettingsTab';
import MapsSettingsTab from '@/components/admin/settings/MapsSettingsTab';
import { TestimonialsManager, GalleryTab, EventsTab } from '@/components/admin/settings/ContentManagementTabs';

const SiteSettings = () => {
  const { settings, loading, updateSetting, getSetting } = useSiteSettings();
  const { toast } = useToast();

  const [siteData, setSiteData] = useState({
    siteName: 'Moxie Vacation Rentals',
    tagline: 'Your perfect getaway is just a click away.',
    description: 'Discover amazing vacation rental properties in prime locations.',
    heroTitle: 'Your Home Away From Home',
    heroSubtitle: 'in Eugene',
    heroDescription: 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.',
    heroBackgroundImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2850&q=80',
    heroLocationText: 'Eugene, Oregon',
    heroRating: '4.9',
    heroCTAText: 'View Properties',
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
      { key: 'heroDescription', value: siteData.heroDescription },
      { key: 'heroBackgroundImage', value: siteData.heroBackgroundImage },
      { key: 'heroLocationText', value: siteData.heroLocationText },
      { key: 'heroRating', value: siteData.heroRating },
      { key: 'heroCTAText', value: siteData.heroCTAText },
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
        heroTitle: getSetting('heroTitle', 'Your Home Away From Home'),
        heroSubtitle: getSetting('heroSubtitle', 'in Eugene'),
        heroDescription: getSetting('heroDescription', 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.'),
        heroBackgroundImage: getSetting('heroBackgroundImage', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2850&q=80'),
        heroLocationText: getSetting('heroLocationText', 'Eugene, Oregon'),
        heroRating: getSetting('heroRating', '4.9'),
        heroCTAText: getSetting('heroCTAText', 'View Properties'),
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
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="testimonials">
              <Star className="h-4 w-4 mr-1" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="gallery">
              <Camera className="h-4 w-4 mr-1" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="events">
              <Calendar className="h-4 w-4 mr-1" />
              Events
            </TabsTrigger>
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
            <GeneralSettingsTab
              siteData={siteData}
              onInputChange={handleInputChange}
              onSave={handleSaveSettings}
            />
          </TabsContent>

          <TabsContent value="hero">
            <HeroSettingsTab
              siteData={siteData}
              onInputChange={handleInputChange}
              onSave={handleSaveSettings}
            />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsManager />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryTab />
          </TabsContent>

          <TabsContent value="events">
            <EventsTab />
          </TabsContent>

          <TabsContent value="social">
            <SocialSettingsTab
              siteData={siteData}
              onSocialMediaChange={handleSocialMediaChange}
              onSave={handleSaveSettings}
            />
          </TabsContent>

          <TabsContent value="seo">
            <SEOSettingsTab
              seoData={seoData}
              setSeoData={setSeoData}
              onSave={handleSaveSeoSettings}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsSettingsTab
              analyticsData={analyticsData}
              setAnalyticsData={setAnalyticsData}
              onSave={handleSaveAnalyticsSettings}
            />
          </TabsContent>

          <TabsContent value="maps">
            <MapsSettingsTab
              mapboxToken={mapboxToken}
              setMapboxToken={setMapboxToken}
              onSave={handleSaveMapboxToken}
            />
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
