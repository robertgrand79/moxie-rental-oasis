
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
import EugeneEventsManager from '@/components/admin/EugeneEventsManager';

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
  const renderSettingContent = () => {
    switch (selectedSetting) {
      case 'site-info':
        return (
          <GeneralInformationSettings
            siteData={siteData}
            onInputChange={onInputChange}
            onSave={onSaveSettings}
            saving={false}
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
            onSave={onSaveSettings}
            saving={{}}
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
            onSave={onSaveSettings}
            saving={{}}
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
              // Save all analytics fields, not just Google Analytics ID
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
                if (!success) {
                  allSuccessful = false;
                }
              }

              if (allSuccessful) {
                setDialogOpen(false);
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
        return <EugeneEventsManager />;
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
