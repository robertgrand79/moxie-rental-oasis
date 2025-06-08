
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Image, Wand2, Share, MapPin, Calendar, Camera, Star } from 'lucide-react';
import ColorCustomizer from '@/components/ColorCustomizer';
import FontCustomizer from '@/components/FontCustomizer';
import LogoUploader from '@/components/LogoUploader';
import AISiteEditor from '@/components/AISiteEditor';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import StableBasicSettingsTab from '@/components/admin/settings/StableBasicSettingsTab';
import SocialSettingsTab from '@/components/admin/settings/SocialSettingsTab';
import SEOSettingsTab from '@/components/admin/settings/SEOSettingsTab';
import AnalyticsSettingsTab from '@/components/admin/settings/AnalyticsSettingsTab';
import MapsSettingsTab from '@/components/admin/settings/MapsSettingsTab';
import { TestimonialsManager, GalleryTab, PointsOfInterestTab, EventsTab } from '@/components/admin/settings/ContentManagementTabs';
import AIContentGenerators from '@/components/admin/AIContentGenerators';
import AIDataEnhancer from '@/components/admin/AIDataEnhancer';
import SettingsErrorBoundary from '@/components/admin/settings/SettingsErrorBoundary';

const SiteSettings = () => {
  const { settings, loading, saveSetting } = useStableSiteSettings();

  const handleSaveSeoSettings = async () => {
    const success = await saveSetting('siteTitle', settings.siteTitle);
    return success;
  };

  const handleSaveAnalyticsSettings = async () => {
    const success = await saveSetting('googleAnalyticsId', settings.googleAnalyticsId);
    return success;
  };

  const handleSaveMapboxToken = async () => {
    const success = await saveSetting('mapboxToken', settings.mapboxToken);
    return success;
  };

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

        <SettingsErrorBoundary>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-12">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="testimonials">
                <Star className="h-4 w-4 mr-1" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="gallery">
                <Camera className="h-4 w-4 mr-1" />
                Gallery
              </TabsTrigger>
              <TabsTrigger value="points-of-interest">
                <MapPin className="h-4 w-4 mr-1" />
                POI
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="h-4 w-4 mr-1" />
                Events
              </TabsTrigger>
              <TabsTrigger value="ai-generator">
                <Wand2 className="h-4 w-4 mr-1" />
                AI Generator
              </TabsTrigger>
              <TabsTrigger value="ai-enhancer">
                <Wand2 className="h-4 w-4 mr-1" />
                AI Enhancer
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
              <StableBasicSettingsTab />
            </TabsContent>

            <TabsContent value="testimonials">
              <TestimonialsManager />
            </TabsContent>

            <TabsContent value="gallery">
              <GalleryTab />
            </TabsContent>

            <TabsContent value="points-of-interest">
              <PointsOfInterestTab />
            </TabsContent>

            <TabsContent value="events">
              <EventsTab />
            </TabsContent>

            <TabsContent value="ai-generator">
              <AIContentGenerators />
            </TabsContent>

            <TabsContent value="ai-enhancer">
              <AIDataEnhancer />
            </TabsContent>

            <TabsContent value="social">
              <SocialSettingsTab
                siteData={settings}
                onSocialMediaChange={() => {}}
                onSave={() => {}}
              />
            </TabsContent>

            <TabsContent value="seo">
              <SEOSettingsTab
                seoData={{
                  siteTitle: settings.siteTitle,
                  metaDescription: settings.metaDescription,
                  ogTitle: settings.ogTitle,
                  ogDescription: settings.ogDescription,
                  ogImage: settings.ogImage,
                  favicon: settings.favicon
                }}
                setSeoData={() => {}}
                onSave={handleSaveSeoSettings}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsSettingsTab
                analyticsData={{
                  googleAnalyticsId: settings.googleAnalyticsId,
                  googleTagManagerId: settings.googleTagManagerId,
                  facebookPixelId: settings.facebookPixelId,
                  customHeaderScripts: settings.customHeaderScripts,
                  customFooterScripts: settings.customFooterScripts,
                  customCss: settings.customCss
                }}
                setAnalyticsData={() => {}}
                onSave={handleSaveAnalyticsSettings}
              />
            </TabsContent>

            <TabsContent value="maps">
              <MapsSettingsTab
                mapboxToken={settings.mapboxToken}
                setMapboxToken={() => {}}
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
              <AISiteEditor siteData={settings} onUpdateSiteData={() => {}} />
            </TabsContent>
          </Tabs>
        </SettingsErrorBoundary>
      </div>
    </div>
  );
};

export default SiteSettings;
