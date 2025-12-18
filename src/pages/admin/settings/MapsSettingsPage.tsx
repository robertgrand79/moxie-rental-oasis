import React, { useState, useEffect } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { toast } from 'sonner';

const MapsSettingsPage = () => {
  const { isOrgAdmin } = useCurrentOrganization();
  const { settings, saveSetting, loading: settingsLoading } = useSimplifiedSiteSettings();
  const [mapboxToken, setMapboxToken] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize from settings when loaded
  useEffect(() => {
    if (settings?.mapboxToken) {
      setMapboxToken(settings.mapboxToken);
    }
  }, [settings?.mapboxToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapboxToken) return;
    
    setSaving(true);
    try {
      await saveSetting('mapboxToken', mapboxToken);
      toast.success('Mapbox settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const isLoading = settingsLoading || saving;

  return (
    <SettingsSidebarLayout title="Maps" description="Configure map services">
      <Card>
        <CardHeader>
          <CardTitle>Mapbox</CardTitle>
          <CardDescription>Configure Mapbox for interactive maps on your site.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Mapbox Access Token</Label>
              <Input 
                id="mapbox-token"
                type="text" 
                placeholder="pk.eyJ..." 
                value={mapboxToken} 
                onChange={(e) => setMapboxToken(e.target.value)} 
                disabled={!isOrgAdmin() || isLoading} 
              />
              <p className="text-xs text-muted-foreground">
                Get your public access token from{' '}
                <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Mapbox Account
                </a>
              </p>
            </div>
            {isOrgAdmin() && (
              <Button type="submit" disabled={isLoading}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </SettingsSidebarLayout>
  );
};

export default MapsSettingsPage;
