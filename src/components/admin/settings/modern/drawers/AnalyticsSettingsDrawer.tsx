import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import AnalyticsSettingsTab from '@/components/admin/settings/AnalyticsSettingsTab';

interface AnalyticsSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AnalyticsSettingsDrawer: React.FC<AnalyticsSettingsDrawerProps> = ({ open, onOpenChange }) => {
  const { settings, loading, saveSetting } = useSimplifiedSiteSettings();
  const [saving, setSaving] = useState(false);

  const [analyticsData, setAnalyticsData] = useState({
    googleAnalyticsId: settings?.googleAnalyticsId || '',
    googleTagManagerId: settings?.googleTagManagerId || '',
    facebookPixelId: settings?.facebookPixelId || '',
    customHeaderScripts: settings?.customHeaderScripts || '',
    customFooterScripts: settings?.customFooterScripts || '',
    customCss: settings?.customCss || '',
  });

  // Update local state when settings load
  React.useEffect(() => {
    if (settings) {
      setAnalyticsData({
        googleAnalyticsId: settings.googleAnalyticsId || '',
        googleTagManagerId: settings.googleTagManagerId || '',
        facebookPixelId: settings.facebookPixelId || '',
        customHeaderScripts: settings.customHeaderScripts || '',
        customFooterScripts: settings.customFooterScripts || '',
        customCss: settings.customCss || '',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fieldsToSave = Object.keys(analyticsData) as (keyof typeof analyticsData)[];
      for (const field of fieldsToSave) {
        await saveSetting(field, analyticsData[field]);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Analytics Settings</DrawerTitle>
          <DrawerDescription>Configure tracking and analytics</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <AnalyticsSettingsTab
              analyticsData={analyticsData}
              setAnalyticsData={setAnalyticsData}
              onSave={handleSave}
            />
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default AnalyticsSettingsDrawer;
