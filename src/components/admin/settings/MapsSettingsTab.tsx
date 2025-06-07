
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface MapsSettingsTabProps {
  mapboxToken: string;
  setMapboxToken: (token: string) => void;
  onSave: () => void;
}

const MapsSettingsTab = ({ mapboxToken, setMapboxToken, onSave }: MapsSettingsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maps Configuration</CardTitle>
        <CardDescription>
          Configure your Mapbox token for displaying property locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">About Mapbox Token</h4>
          <p className="text-sm text-blue-800 mb-3">
            A Mapbox public token is required to display interactive maps with property locations. 
            This token is safe to use in frontend applications and allows your visitors to view property locations.
          </p>
          <p className="text-sm text-blue-700">
            Get your free token at{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="underline hover:text-blue-900"
            >
              mapbox.com
            </a>
            {' '}(look for "Access tokens" in your account dashboard)
          </p>
        </div>

        <div>
          <Label htmlFor="mapboxToken">Mapbox Public Token</Label>
          <Input
            id="mapboxToken"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwi..."
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Public tokens start with "pk." and are safe to use in web applications
          </p>
        </div>

        {mapboxToken && (
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-sm text-green-800">
              ✓ Token configured. Maps will now display on your property listings page.
            </p>
          </div>
        )}

        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Mapbox Token
        </Button>
      </CardContent>
    </Card>
  );
};

export default MapsSettingsTab;
