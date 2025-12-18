import React, { useState } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSecureApiKeys } from '@/hooks/useSecureApiKeys';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

const MapsSettingsPage = () => {
  const { organization, isOrgAdmin } = useCurrentOrganization();
  const { setApiKey, loading } = useSecureApiKeys();
  const { settings, saveSetting } = useSimplifiedSiteSettings();
  const [mapboxToken, setMapboxToken] = useState(settings?.mapboxToken || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !mapboxToken) return;
    const success = await setApiKey(organization.id, 'mapbox_api_key', mapboxToken);
    if (success) await saveSetting('mapboxToken', mapboxToken);
  };

  return (
    <SettingsSidebarLayout title="Maps" description="Configure map services">
      <Card>
        <CardHeader><CardTitle>Mapbox</CardTitle><CardDescription>Configure Mapbox for interactive maps.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Mapbox Access Token</Label><Input type="password" placeholder="pk...." value={mapboxToken} onChange={(e) => setMapboxToken(e.target.value)} disabled={!isOrgAdmin() || loading} /></div>
            {isOrgAdmin() && <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Settings'}</Button>}
          </form>
        </CardContent>
      </Card>
    </SettingsSidebarLayout>
  );
};

export default MapsSettingsPage;
