
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface AnalyticsData {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  customHeaderScripts: string;
  customFooterScripts: string;
  customCss: string;
}

interface AnalyticsSettingsTabProps {
  analyticsData: AnalyticsData;
  setAnalyticsData: (data: AnalyticsData) => void;
  onSave: () => void;
}

const AnalyticsSettingsTab = ({ analyticsData, setAnalyticsData, onSave }: AnalyticsSettingsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics & Custom Scripts</CardTitle>
        <CardDescription>
          Add tracking codes and custom scripts to your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="googleAnalyticsId">Google Analytics ID (GA4)</Label>
          <Input
            id="googleAnalyticsId"
            value={analyticsData.googleAnalyticsId}
            onChange={(e) => setAnalyticsData({ ...analyticsData, googleAnalyticsId: e.target.value })}
            placeholder="G-XXXXXXXXXX"
          />
        </div>

        <div>
          <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
          <Input
            id="googleTagManagerId"
            value={analyticsData.googleTagManagerId}
            onChange={(e) => setAnalyticsData({ ...analyticsData, googleTagManagerId: e.target.value })}
            placeholder="GTM-XXXXXXX"
          />
        </div>

        <div>
          <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Enter your 15-16 digit numeric Pixel ID from Meta Business Suite → Events Manager
          </p>
          <Input
            id="facebookPixelId"
            value={analyticsData.facebookPixelId}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setAnalyticsData({ ...analyticsData, facebookPixelId: value });
            }}
            placeholder="123456789012345"
            maxLength={16}
          />
        </div>

        <div>
          <Label htmlFor="customHeaderScripts">Custom Header Scripts</Label>
          <Textarea
            id="customHeaderScripts"
            value={analyticsData.customHeaderScripts}
            onChange={(e) => setAnalyticsData({ ...analyticsData, customHeaderScripts: e.target.value })}
            placeholder="JavaScript code to be added before </head>"
            rows={4}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="customFooterScripts">Custom Footer Scripts</Label>
          <Textarea
            id="customFooterScripts"
            value={analyticsData.customFooterScripts}
            onChange={(e) => setAnalyticsData({ ...analyticsData, customFooterScripts: e.target.value })}
            placeholder="JavaScript code to be added before </body>"
            rows={4}
            className="font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="customCss">Custom CSS</Label>
          <Textarea
            id="customCss"
            value={analyticsData.customCss}
            onChange={(e) => setAnalyticsData({ ...analyticsData, customCss: e.target.value })}
            placeholder="Custom CSS styles"
            rows={4}
            className="font-mono text-sm"
          />
        </div>

        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Analytics Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSettingsTab;
