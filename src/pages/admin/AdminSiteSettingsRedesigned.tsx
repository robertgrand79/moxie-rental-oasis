
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, Image, Share, MapPin, Calendar, Camera, Star } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsSearch from '@/components/admin/settings/SettingsSearch';
import SettingsCategoryGrid from '@/components/admin/settings/SettingsCategoryGrid';
import SettingsContentArea from '@/components/admin/settings/SettingsContentArea';
import SettingsDialog from '@/components/admin/settings/SettingsDialog';
import { createSettingsCategories } from '@/components/admin/settings/settingsCategories';
import { useSettingsData } from '@/hooks/useSettingsData';
import ColorCustomizer from '@/components/ColorCustomizer';
import FontCustomizer from '@/components/FontCustomizer';
import LogoUploader from '@/components/LogoUploader';
import SocialSettingsTab from '@/components/admin/settings/SocialSettingsTab';
import SEOSettingsTab from '@/components/admin/settings/SEOSettingsTab';
import AnalyticsSettingsTab from '@/components/admin/settings/AnalyticsSettingsTab';
import MapsSettingsTab from '@/components/admin/settings/MapsSettingsTab';
import { TestimonialsManager, GalleryTab, PointsOfInterestTab, EventsTab } from '@/components/admin/settings/ContentManagementTabs';
import SettingsErrorBoundary from '@/components/admin/settings/SettingsErrorBoundary';

const AdminSiteSettingsRedesigned = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'advanced' | 'simple'>('advanced');
  
  const {
    siteData,
    setSiteData,
    seoData,
    setSeoData,
    analyticsData,
    setAnalyticsData,
    mapboxToken,
    setMapboxToken,
    updateSetting,
    loading,
    error
  } = useSettingsData();

  const handleInputChange = (field: string, value: string) => {
    setSiteData((prev: any) => ({ ...prev, [field]: value }));
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

  const handleSaveSettings = async () => {
    await updateSetting('siteName', siteData.siteName);
    await updateSetting('tagline', siteData.tagline);
    await updateSetting('description', siteData.description);
    await updateSetting('contactEmail', siteData.contactEmail);
    await updateSetting('phone', siteData.phone);
    await updateSetting('address', siteData.address);
    await updateSetting('socialMedia', siteData.socialMedia);
    setDialogOpen(false);
  };

  const handleSaveSeoSettings = async () => {
    const success = await updateSetting('siteTitle', seoData.siteTitle);
    return success;
  };

  const handleSaveAnalyticsSettings = async () => {
    const success = await updateSetting('googleAnalyticsId', analyticsData.googleAnalyticsId);
    return success;
  };

  const handleSaveMapboxToken = async () => {
    const success = await updateSetting('mapboxToken', mapboxToken);
    return success;
  };

  const settingsCategories = createSettingsCategories(siteData, seoData, analyticsData, mapboxToken);

  const filteredCategories = settingsCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.settings.some(setting => 
      setting.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const activeSettings = settingsCategories.find(cat => cat.id === activeCategory)?.settings || [];

  const handleSettingClick = (settingKey: string) => {
    setSelectedSetting(settingKey);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <AdminPageWrapper
        title="Site Settings"
        description="Configure and customize your website settings"
      >
        <div className="p-8 text-center">
          <p>Loading settings...</p>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Site Settings"
      description="Configure and customize your website settings"
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* View Mode Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('advanced')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'advanced'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Advanced Settings
            </button>
            <button
              onClick={() => setViewMode('simple')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'simple'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Simple View
            </button>
          </div>
        </div>

        {viewMode === 'advanced' ? (
          <>
            {/* Search Section */}
            <SettingsSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Category Navigation */}
            <SettingsCategoryGrid
              filteredCategories={filteredCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            {/* Settings Content */}
            {filteredCategories.find(cat => cat.id === activeCategory) && (
              <SettingsContentArea
                activeCategory={activeCategory}
                filteredCategories={filteredCategories}
                onSettingClick={handleSettingClick}
              />
            )}

            {/* Settings Modal */}
            <SettingsDialog
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              selectedSetting={selectedSetting}
              activeSettings={activeSettings}
              siteData={siteData}
              onInputChange={handleInputChange}
              onSocialMediaChange={handleSocialMediaChange}
              onSaveSettings={handleSaveSettings}
              seoData={seoData}
              setSeoData={setSeoData}
              analyticsData={analyticsData}
              setAnalyticsData={setAnalyticsData}
              mapboxToken={mapboxToken}
              setMapboxToken={setMapboxToken}
              updateSetting={updateSetting}
            />
          </>
        ) : (
          <SettingsErrorBoundary>
            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-11">
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
              </TabsList>

              <TabsContent value="general">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                      <input
                        type="text"
                        value={siteData.siteName}
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={siteData.tagline}
                        onChange={(e) => handleInputChange('tagline', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Save General Settings
                  </button>
                </div>
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
            </Tabs>
          </SettingsErrorBoundary>
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSiteSettingsRedesigned;
