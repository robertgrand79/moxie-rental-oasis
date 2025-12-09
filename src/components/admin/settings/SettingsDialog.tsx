
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GeneralInformationSettings from '@/components/admin/settings/GeneralInformationSettings';
import HeroSectionSettings from '@/components/admin/settings/HeroSectionSettings';
import ContactInformationSettings from '@/components/admin/settings/ContactInformationSettings';
import DesignBrandingTab from '@/components/admin/settings/DesignBrandingTab';
import SEOSettingsTab from '@/components/admin/settings/SEOSettingsTab';
import AnalyticsSettingsTab from '@/components/admin/settings/AnalyticsSettingsTab';
import MapsSettingsTab from '@/components/admin/settings/MapsSettingsTab';
import EmailServicesTab from '@/components/admin/settings/EmailServicesTab';
import AdvancedSettingsTab from '@/components/admin/settings/AdvancedSettingsTab';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import PointsOfInterestManager from '@/components/admin/PointsOfInterestManager';
import LocalEventsManager from '@/components/admin/LocalEventsManager';

interface SettingsDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  selectedSetting: string | null;
  activeSettings: Array<{
    name: string;
    description: string;
    status: string;
    key: string;
  }>;
  siteData: any;
  onInputChange: (field: string, value: string) => void;
  onSocialMediaChange: (platform: string, value: string) => void;
  onSaveSettings: () => Promise<void>;
  seoData: any;
  setSeoData: (data: any) => void;
  analyticsData: any;
  setAnalyticsData: (data: any) => void;
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  updateSetting: (key: string, value: any) => Promise<boolean>;
}

const SettingsDialog = ({
  dialogOpen,
  setDialogOpen,
  selectedSetting,
  activeSettings,
  siteData,
  onInputChange,
  onSocialMediaChange,
  onSaveSettings,
  seoData,
  setSeoData,
  analyticsData,
  setAnalyticsData,
  mapboxToken,
  setMapboxToken,
  updateSetting
}: SettingsDialogProps) => {
  const [saving, setSaving] = React.useState(false);

  // Save handler for site-info (General Information)
  const handleSaveSiteInfo = async () => {
    setSaving(true);
    try {
      const fieldsToSave = ['siteName', 'tagline', 'description'];
      let allSuccessful = true;
      
      for (const field of fieldsToSave) {
        const value = siteData[field];
        if (value !== undefined) {
          const success = await updateSetting(field, value);
          if (!success) allSuccessful = false;
        }
      }
      
      if (allSuccessful) {
        setDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  // Save handler for hero-section
  const handleSaveHeroSection = async () => {
    setSaving(true);
    try {
      const fieldsToSave = ['heroTitle', 'heroSubtitle', 'heroDescription', 'heroBackgroundImage', 'heroLocationText', 'heroRating', 'heroCTAText'];
      let allSuccessful = true;
      
      for (const field of fieldsToSave) {
        const value = siteData[field];
        if (value !== undefined) {
          const success = await updateSetting(field, value);
          if (!success) allSuccessful = false;
        }
      }
      
      if (allSuccessful) {
        setDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  // Save handler for contact-info
  const handleSaveContactInfo = async () => {
    setSaving(true);
    try {
      const fieldsToSave = ['contactEmail', 'phone', 'address', 'socialMedia'];
      let allSuccessful = true;
      
      for (const field of fieldsToSave) {
        const value = siteData[field];
        if (value !== undefined) {
          const success = await updateSetting(field, value);
          if (!success) allSuccessful = false;
        }
      }
      
      if (allSuccessful) {
        setDialogOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const renderSettingContent = () => {
    switch (selectedSetting) {
      case 'site-info':
        return (
          <GeneralInformationSettings
            siteData={siteData}
            onInputChange={onInputChange}
            onSave={handleSaveSiteInfo}
            saving={saving}
          />
        );
      case 'hero-section':
        return (
          <HeroSectionSettings
            localData={{
              heroTitle: siteData.heroTitle || '',
              heroSubtitle: siteData.heroSubtitle || '',
              heroDescription: siteData.heroDescription || '',
              heroBackgroundImage: siteData.heroBackgroundImage || '',
              heroLocationText: siteData.heroLocationText || '',
              heroRating: siteData.heroRating || '',
              heroCTAText: siteData.heroCTAText || ''
            }}
            onInputChange={onInputChange}
            onSave={handleSaveHeroSection}
            saving={{ heroSection: saving }}
          />
        );
      case 'contact-info':
        return (
          <ContactInformationSettings
            localData={{
              contactEmail: siteData.contactEmail || '',
              phone: siteData.phone || '',
              address: siteData.address || ''
            }}
            onInputChange={onInputChange}
            onSave={handleSaveContactInfo}
            saving={{ contactInfo: saving }}
          />
        );
      case 'design-branding':
        return <DesignBrandingTab />;
      case 'seo-settings':
        return <SEOSettingsTab />;
      case 'analytics-settings':
        return (
          <AnalyticsSettingsTab
            analyticsData={analyticsData}
            setAnalyticsData={setAnalyticsData}
            onSave={async () => {
              setSaving(true);
              try {
                const settingsToSave = [
                  { key: 'googleAnalyticsId', value: analyticsData.googleAnalyticsId },
                  { key: 'googleTagManagerId', value: analyticsData.googleTagManagerId },
                  { key: 'facebookPixelId', value: analyticsData.facebookPixelId },
                  { key: 'customHeaderScripts', value: analyticsData.customHeaderScripts },
                  { key: 'customFooterScripts', value: analyticsData.customFooterScripts },
                  { key: 'customCss', value: analyticsData.customCss }
                ];

                let allSuccessful = true;
                for (const setting of settingsToSave) {
                  const success = await updateSetting(setting.key, setting.value);
                  if (!success) allSuccessful = false;
                }

                if (allSuccessful) {
                  setDialogOpen(false);
                }
              } finally {
                setSaving(false);
              }
            }}
          />
        );
      case 'email-services':
        return <EmailServicesTab />;
      case 'maps-settings':
        return (
          <MapsSettingsTab
            mapboxToken={mapboxToken}
            setMapboxToken={setMapboxToken}
            onSave={async () => {
              await updateSetting('mapboxToken', mapboxToken);
              setDialogOpen(false);
            }}
          />
        );
      case 'advanced-settings':
        return (
          <AdvancedSettingsTab
            analyticsData={analyticsData}
            setAnalyticsData={setAnalyticsData}
            updateSetting={updateSetting}
          />
        );
      case 'content-testimonials':
        return <TestimonialsManager />;
      case 'content-places':
        return <PointsOfInterestManager />;
      case 'content-events':
        return <LocalEventsManager />;
      default:
        return <div>Select a setting to configure</div>;
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {selectedSetting && activeSettings.find(s => s.key === selectedSetting)?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-6">
          {renderSettingContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
