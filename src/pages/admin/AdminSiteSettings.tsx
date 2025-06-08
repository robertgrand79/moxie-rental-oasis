
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Palette, Type, Image, Wand2, BarChart3 } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import BasicSettingsTab from '@/components/admin/settings/BasicSettingsTab';
import ContentManagementTab from '@/components/admin/settings/ContentManagementTab';
import DesignBrandingTab from '@/components/admin/settings/DesignBrandingTab';
import SEOAnalyticsTab from '@/components/admin/settings/SEOAnalyticsTab';
import AIToolsTab from '@/components/admin/settings/AIToolsTab';
import AdvancedSettingsTab from '@/components/admin/settings/AdvancedSettingsTab';

const AdminSiteSettings = () => {
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
      <AdminPageWrapper 
        title="Site Settings"
        description="Configure your website's appearance and functionality"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper 
      title="Site Settings"
      description="Configure your website's appearance, content, and functionality"
      actions={
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          <Settings className="h-3 w-3 mr-1" />
          Configuration
        </Badge>
      }
    >
      <div className="p-8">
        <Tabs defaultValue="basic" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
            <TabsTrigger value="basic" className="flex items-center space-x-2 rounded-xl">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2 rounded-xl">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center space-x-2 rounded-xl">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Design</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center space-x-2 rounded-xl">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center space-x-2 rounded-xl">
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tools</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2 rounded-xl">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <BasicSettingsTab 
              siteData={siteData}
              setSiteData={setSiteData}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentManagementTab />
          </TabsContent>

          <TabsContent value="design" className="space-y-6">
            <DesignBrandingTab />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOAnalyticsTab 
              seoData={seoData}
              setSeoData={setSeoData}
              analyticsData={analyticsData}
              setAnalyticsData={setAnalyticsData}
              mapboxToken={mapboxToken}
              setMapboxToken={setMapboxToken}
              updateSetting={updateSetting}
            />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AIToolsTab siteData={siteData} setSiteData={setSiteData} />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <AdvancedSettingsTab 
              analyticsData={analyticsData}
              setAnalyticsData={setAnalyticsData}
              updateSetting={updateSetting}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSiteSettings;
