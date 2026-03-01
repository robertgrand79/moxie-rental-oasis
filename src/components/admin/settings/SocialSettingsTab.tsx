
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
    youtubeVideoUrl?: string;
    tiktokProfileUrl?: string;
    instagramFeedUrl?: string;
  };
  onSocialMediaChange: (platform: string, value: string) => void;
  onSettingChange?: (key: string, value: string) => void;
  onSave: () => void;
}

const SocialSettingsTab = ({ siteData, onSocialMediaChange, onSettingChange, onSave }: SocialSettingsTabProps) => {
  return (
    <div className="space-y-6">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Media & Social Feeds</CardTitle>
          <CardDescription>
            Add YouTube, Instagram, and TikTok links to show rich media sections on your property page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label htmlFor="youtubeVideoUrl">YouTube Video URL</Label>
              <Input
                id="youtubeVideoUrl"
                value={siteData.youtubeVideoUrl || ''}
                onChange={(e) => onSettingChange?.('youtubeVideoUrl', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                A YouTube video link (e.g. property tour) that will appear as an embedded video section
              </p>
            </div>
            <div>
              <Label htmlFor="instagramFeedUrl">Instagram Feed URL</Label>
              <Input
                id="instagramFeedUrl"
                value={siteData.instagramFeedUrl || ''}
                onChange={(e) => onSettingChange?.('instagramFeedUrl', e.target.value)}
                placeholder="https://instagram.com/youraccount"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your Instagram profile URL — shows a social card on the property page
              </p>
            </div>
            <div>
              <Label htmlFor="tiktokProfileUrl">TikTok Profile URL</Label>
              <Input
                id="tiktokProfileUrl"
                value={siteData.tiktokProfileUrl || ''}
                onChange={(e) => onSettingChange?.('tiktokProfileUrl', e.target.value)}
                placeholder="https://tiktok.com/@youraccount"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your TikTok profile URL — shows a social card on the property page
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={onSave} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        Save Social Media Settings
      </Button>
    </div>
  );
};

export default SocialSettingsTab;
