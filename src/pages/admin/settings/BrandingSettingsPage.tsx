import React from 'react';
import { ImageIcon } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LogoUploader from '@/components/LogoUploader';

const BrandingSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="Branding" 
      description="Upload your brand assets"
      icon={ImageIcon}
    >
      <Card>
        <CardHeader>
          <CardTitle>Logo & Favicon</CardTitle>
          <CardDescription>Upload your brand assets</CardDescription>
        </CardHeader>
        <CardContent>
          <LogoUploader />
        </CardContent>
      </Card>
    </SettingsSidebarLayout>
  );
};

export default BrandingSettingsPage;
