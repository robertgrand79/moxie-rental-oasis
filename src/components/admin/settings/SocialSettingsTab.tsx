
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface SocialSettingsTabProps {
  siteData: {
    socialMedia: {
      facebook: string;
      instagram: string;
      twitter: string;
      googlePlaces: string;
    };
  };
  onSocialMediaChange: (platform: string, value: string) => void;
  onSave: () => void;
}

const SocialSettingsTab = ({ siteData, onSocialMediaChange, onSave }: SocialSettingsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Configure your social media URLs that will appear in the footer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label htmlFor="facebook">Facebook URL</Label>
            <Input
              id="facebook"
              value={siteData.socialMedia.facebook}
              onChange={(e) => onSocialMediaChange('facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram URL</Label>
            <Input
              id="instagram"
              value={siteData.socialMedia.instagram}
              onChange={(e) => onSocialMediaChange('instagram', e.target.value)}
              placeholder="https://instagram.com/youraccount"
            />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter URL</Label>
            <Input
              id="twitter"
              value={siteData.socialMedia.twitter}
              onChange={(e) => onSocialMediaChange('twitter', e.target.value)}
              placeholder="https://twitter.com/youraccount"
            />
          </div>
          <div>
            <Label htmlFor="googlePlaces">Google Places URL</Label>
            <Input
              id="googlePlaces"
              value={siteData.socialMedia.googlePlaces}
              onChange={(e) => onSocialMediaChange('googlePlaces', e.target.value)}
              placeholder="https://maps.google.com/yourplace"
            />
          </div>
        </div>

        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Social Media Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialSettingsTab;
