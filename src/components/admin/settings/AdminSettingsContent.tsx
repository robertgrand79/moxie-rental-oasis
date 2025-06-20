
import React, { useState } from 'react';
import SettingsSearch from './SettingsSearch';
import SettingsCategoryGrid from './SettingsCategoryGrid';
import SettingsContentArea from './SettingsContentArea';
import SettingsDialog from './SettingsDialog';
import StaticSettingsSyncButton from './StaticSettingsSyncButton';
import SettingsInputHandlers from './SettingsInputHandlers';
import { createSettingsCategories } from './settingsCategories';

interface AdminSettingsContentProps {
  localData: any;
  setLocalData: React.Dispatch<React.SetStateAction<any>>;
  updateSettingOptimistic: (updates: any) => void;
  saveSettings: (updates: any) => Promise<boolean>;
  saveSetting: (key: string, value: any) => Promise<boolean>;
}

const AdminSettingsContent = ({
  localData,
  setLocalData,
  updateSettingOptimistic,
  saveSettings,
  saveSetting
}: AdminSettingsContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSaveSettings = async () => {
    console.log('[Settings Page] Saving settings...');
    const success = await saveSettings({
      siteName: localData.siteData.siteName,
      tagline: localData.siteData.tagline,
      description: localData.siteData.description,
      contactEmail: localData.siteData.contactEmail,
      phone: localData.siteData.phone,
      address: localData.siteData.address,
      socialMedia: localData.siteData.socialMedia
    });

    if (success) {
      setDialogOpen(false);
    }
  };

  const settingsCategories = createSettingsCategories(
    localData.siteData, 
    localData.seoData, 
    localData.analyticsData, 
    localData.mapboxToken, 
    localData.siteData.emailSetupVerified
  );

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

  return (
    <SettingsInputHandlers
      localData={localData}
      setLocalData={setLocalData}
      updateSettingOptimistic={updateSettingOptimistic}
    >
      {({ handleInputChange, handleSocialMediaChange }) => (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
          {/* Static Settings Sync Button - Show at top */}
          <StaticSettingsSyncButton />

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
            siteData={localData.siteData}
            onInputChange={handleInputChange}
            onSocialMediaChange={handleSocialMediaChange}
            onSaveSettings={handleSaveSettings}
            seoData={localData.seoData}
            setSeoData={(data) => setLocalData((prev: any) => ({ ...prev, seoData: data }))}
            analyticsData={localData.analyticsData}
            setAnalyticsData={(data) => setLocalData((prev: any) => ({ ...prev, analyticsData: data }))}
            mapboxToken={localData.mapboxToken}
            setMapboxToken={(token) => setLocalData((prev: any) => ({ ...prev, mapboxToken: token }))}
            updateSetting={saveSetting}
          />
        </div>
      )}
    </SettingsInputHandlers>
  );
};

export default AdminSettingsContent;
