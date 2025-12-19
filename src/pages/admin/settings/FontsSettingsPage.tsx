import React from 'react';
import { Type } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FontCustomizer from '@/components/FontCustomizer';

const FontsSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="Fonts" 
      description="Choose fonts for your site"
      icon={Type}
    >
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Choose fonts for your site</CardDescription>
        </CardHeader>
        <CardContent>
          <FontCustomizer />
        </CardContent>
      </Card>
    </SettingsSidebarLayout>
  );
};

export default FontsSettingsPage;
