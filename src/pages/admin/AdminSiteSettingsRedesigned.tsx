
import React, { useState } from 'react';
import { Palette, Type, Image, Share, MapPin, Calendar, Camera, Star } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsSearch from '@/components/admin/settings/SettingsSearch';
import SettingsCategoryGrid from '@/components/admin/settings/SettingsCategoryGrid';
import SettingsContentArea from '@/components/admin/settings/SettingsContentArea';
import SettingsDialog from '@/components/admin/settings/SettingsDialog';
import { createSettingsCategories } from '@/components/admin/settings/settingsCategories';
import { useSettingsData } from '@/hooks/useSettingsData';

const AdminSiteSettingsRedesigned = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
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

  // Get email setup status from siteData (this comes from useSettingsData which loads from database)
  const emailSetupVerified = siteData.emailSetupVerified === 'true' || siteData.emailSetupVerified === true;

  const settingsCategories = createSettingsCategories(siteData, seoData, analyticsData, mapboxToken, emailSetupVerified);

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
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSiteSettingsRedesigned;
