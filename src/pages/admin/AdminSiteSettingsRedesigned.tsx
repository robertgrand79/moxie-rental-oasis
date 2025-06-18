
import React, { useState } from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsSearch from '@/components/admin/settings/SettingsSearch';
import SettingsCategoryGrid from '@/components/admin/settings/SettingsCategoryGrid';
import SettingsContentArea from '@/components/admin/settings/SettingsContentArea';
import SettingsDialog from '@/components/admin/settings/SettingsDialog';
import { createSettingsCategories } from '@/components/admin/settings/settingsCategories';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

const AdminSiteSettingsRedesigned = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    settings,
    loading,
    error,
    saveSetting,
    saveSettings,
    updateSettingOptimistic,
    saving
  } = useSimplifiedSiteSettings();

  // Local state for form data
  const [localData, setLocalData] = useState({
    siteData: {
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
      },
      emailSetupVerified: settings.emailSetupVerified || false
    },
    seoData: {
      siteTitle: settings.siteTitle || '',
      metaDescription: settings.metaDescription || '',
      ogTitle: settings.ogTitle || '',
      ogDescription: settings.ogDescription || '',
      ogImage: settings.ogImage || '',
      favicon: settings.favicon || ''
    },
    analyticsData: {
      googleAnalyticsId: settings.googleAnalyticsId || '',
      googleTagManagerId: settings.googleTagManagerId || '',
      facebookPixelId: settings.facebookPixelId || '',
      customHeaderScripts: settings.customHeaderScripts || '',
      customFooterScripts: settings.customFooterScripts || '',
      customCss: settings.customCss || ''
    },
    mapboxToken: settings.mapboxToken || ''
  });

  // Update local data when settings change
  React.useEffect(() => {
    if (!loading) {
      console.log('[Settings Page] Updating local data from settings:', settings);
      setLocalData({
        siteData: {
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
          },
          emailSetupVerified: settings.emailSetupVerified || false
        },
        seoData: {
          siteTitle: settings.siteTitle || '',
          metaDescription: settings.metaDescription || '',
          ogTitle: settings.ogTitle || '',
          ogDescription: settings.ogDescription || '',
          ogImage: settings.ogImage || '',
          favicon: settings.favicon || ''
        },
        analyticsData: {
          googleAnalyticsId: settings.googleAnalyticsId || '',
          googleTagManagerId: settings.googleTagManagerId || '',
          facebookPixelId: settings.facebookPixelId || '',
          customHeaderScripts: settings.customHeaderScripts || '',
          customFooterScripts: settings.customFooterScripts || '',
          customCss: settings.customCss || ''
        },
        mapboxToken: settings.mapboxToken || ''
      });
    }
  }, [settings, loading]);

  const handleInputChange = (field: string, value: string) => {
    console.log('[Settings Page] Input change:', field, value);
    setLocalData(prev => ({
      ...prev,
      siteData: {
        ...prev.siteData,
        [field]: value
      }
    }));
    // Optimistic update
    updateSettingOptimistic({ [field]: value } as any);
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    console.log('[Settings Page] Social media change:', platform, value);
    const newSocialMedia = {
      ...localData.siteData.socialMedia,
      [platform]: value
    };
    setLocalData(prev => ({
      ...prev,
      siteData: {
        ...prev.siteData,
        socialMedia: newSocialMedia
      }
    }));
    updateSettingOptimistic({ socialMedia: newSocialMedia });
  };

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

  if (error) {
    return (
      <AdminPageWrapper
        title="Site Settings"
        description="Configure and customize your website settings"
      >
        <div className="p-8 text-center">
          <p className="text-red-600">Error loading settings: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
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
          siteData={localData.siteData}
          onInputChange={handleInputChange}
          onSocialMediaChange={handleSocialMediaChange}
          onSaveSettings={handleSaveSettings}
          seoData={localData.seoData}
          setSeoData={(data) => setLocalData(prev => ({ ...prev, seoData: data }))}
          analyticsData={localData.analyticsData}
          setAnalyticsData={(data) => setLocalData(prev => ({ ...prev, analyticsData: data }))}
          mapboxToken={localData.mapboxToken}
          setMapboxToken={(token) => setLocalData(prev => ({ ...prev, mapboxToken: token }))}
          updateSetting={saveSetting}
        />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminSiteSettingsRedesigned;
