import React from 'react';
import { Palette } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ColorCustomizer from '@/components/ColorCustomizer';

const ColorsSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="Colors" 
      description="Customize your site's color palette"
      icon={Palette}
    >
      <Card>
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
          <CardDescription>Customize your site's color palette</CardDescription>
        </CardHeader>
        <CardContent>
          <ColorCustomizer />
        </CardContent>
      </Card>
    </SettingsSidebarLayout>
  );
};

export default ColorsSettingsPage;
