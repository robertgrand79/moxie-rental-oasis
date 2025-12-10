import React, { useState } from 'react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Image, Phone, FileText, BarChart, Users } from 'lucide-react';
import GeneralInformationSettings from '@/components/admin/settings/GeneralInformationSettings';
import HeroSectionSettings from '@/components/admin/settings/HeroSectionSettings';
import ContactInformationSettings from '@/components/admin/settings/ContactInformationSettings';
import SEOSettingsTab from '@/components/admin/settings/SEOSettingsTab';
import AnalyticsSettingsTab from '@/components/admin/settings/AnalyticsSettingsTab';
import AboutPageSettings from '@/components/admin/settings/AboutPageSettings';

const SiteContentSettingsPanel = () => {
  const {
    settings,
    loading,
    error,
    saveSetting,
  } = useSimplifiedSiteSettings();

  const { localData, setLocalData } = useSettingsLocalData(settings, loading);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: string, value: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      siteData: { ...prev.siteData, [field]: value }
    }));
  };

  const handleSaveGeneralInfo = async () => {
    setSaving(prev => ({ ...prev, general: true }));
    try {
      const fieldsToSave = ['siteName', 'tagline', 'description'];
      for (const field of fieldsToSave) {
        const value = localData.siteData[field];
        if (value !== undefined) {
          await saveSetting(field, value);
        }
      }
    } finally {
      setSaving(prev => ({ ...prev, general: false }));
    }
  };

  const handleSaveHeroSection = async () => {
    setSaving(prev => ({ ...prev, hero: true }));
    try {
      const fieldsToSave = ['heroTitle', 'heroSubtitle', 'heroDescription', 'heroBackgroundImage', 'heroLocationText', 'heroRating', 'heroCTAText'];
      for (const field of fieldsToSave) {
        const value = localData.siteData[field];
        if (value !== undefined) {
          await saveSetting(field, value);
        }
      }
    } finally {
      setSaving(prev => ({ ...prev, hero: false }));
    }
  };

  const handleSaveContactInfo = async () => {
    setSaving(prev => ({ ...prev, contact: true }));
    try {
      const fieldsToSave = ['contactEmail', 'phone', 'address'];
      for (const field of fieldsToSave) {
        const value = localData.siteData[field];
        if (value !== undefined) {
          await saveSetting(field, value);
        }
      }
    } finally {
      setSaving(prev => ({ ...prev, contact: false }));
    }
  };

  const handleSaveAboutPage = async () => {
    setSaving(prev => ({ ...prev, about: true }));
    try {
      const fieldsToSave = ['aboutTitle', 'aboutDescription', 'aboutImageUrl', 'founderNames', 'missionStatement', 'missionDescription'];
      for (const field of fieldsToSave) {
        const value = localData.siteData[field];
        if (value !== undefined) {
          await saveSetting(field, value);
        }
      }
    } finally {
      setSaving(prev => ({ ...prev, about: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading settings: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto gap-1 p-1">
        <TabsTrigger value="general" className="flex items-center gap-2 py-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">General</span>
        </TabsTrigger>
        <TabsTrigger value="hero" className="flex items-center gap-2 py-2">
          <Image className="h-4 w-4" />
          <span className="hidden sm:inline">Hero</span>
        </TabsTrigger>
        <TabsTrigger value="about" className="flex items-center gap-2 py-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">About</span>
        </TabsTrigger>
        <TabsTrigger value="contact" className="flex items-center gap-2 py-2">
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">Contact</span>
        </TabsTrigger>
        <TabsTrigger value="seo" className="flex items-center gap-2 py-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">SEO</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2 py-2">
          <BarChart className="h-4 w-4" />
          <span className="hidden sm:inline">Analytics</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <GeneralInformationSettings
          siteData={localData.siteData}
          onInputChange={handleInputChange}
          onSave={handleSaveGeneralInfo}
          saving={saving.general || false}
        />
      </TabsContent>

      <TabsContent value="hero" className="space-y-6">
        <HeroSectionSettings
          localData={{
            heroTitle: localData.siteData.heroTitle || '',
            heroSubtitle: localData.siteData.heroSubtitle || '',
            heroDescription: localData.siteData.heroDescription || '',
            heroBackgroundImage: localData.siteData.heroBackgroundImage || '',
            heroLocationText: localData.siteData.heroLocationText || '',
            heroRating: localData.siteData.heroRating || '',
            heroCTAText: localData.siteData.heroCTAText || ''
          }}
          onInputChange={handleInputChange}
          onSave={handleSaveHeroSection}
          saving={{ heroSection: saving.hero || false }}
        />
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        <AboutPageSettings
          localData={{
            aboutTitle: localData.siteData.aboutTitle || '',
            aboutDescription: localData.siteData.aboutDescription || '',
            aboutImageUrl: localData.siteData.aboutImageUrl || '',
            founderNames: localData.siteData.founderNames || '',
            missionStatement: localData.siteData.missionStatement || '',
            missionDescription: localData.siteData.missionDescription || ''
          }}
          onInputChange={handleInputChange}
          onSave={handleSaveAboutPage}
          saving={saving.about || false}
        />
      </TabsContent>

      <TabsContent value="contact" className="space-y-6">
        <ContactInformationSettings
          localData={{
            contactEmail: localData.siteData.contactEmail || '',
            phone: localData.siteData.phone || '',
            address: localData.siteData.address || ''
          }}
          onInputChange={handleInputChange}
          onSave={handleSaveContactInfo}
          saving={{ contactInfo: saving.contact || false }}
        />
      </TabsContent>

      <TabsContent value="seo" className="space-y-6">
        <SEOSettingsTab />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <AnalyticsSettingsTab
          analyticsData={localData.analyticsData}
          setAnalyticsData={(data) => setLocalData((prev: any) => ({ ...prev, analyticsData: data }))}
          onSave={async () => {
            setSaving(prev => ({ ...prev, analytics: true }));
            try {
              const settingsToSave = [
                { key: 'googleAnalyticsId', value: localData.analyticsData.googleAnalyticsId },
                { key: 'googleTagManagerId', value: localData.analyticsData.googleTagManagerId },
                { key: 'facebookPixelId', value: localData.analyticsData.facebookPixelId },
              ];
              for (const setting of settingsToSave) {
                await saveSetting(setting.key, setting.value);
              }
            } finally {
              setSaving(prev => ({ ...prev, analytics: false }));
            }
          }}
        />
      </TabsContent>
    </Tabs>
  );
};

export default SiteContentSettingsPanel;
