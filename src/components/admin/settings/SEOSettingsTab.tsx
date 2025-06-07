
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface SEOData {
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
}

interface SEOSettingsTabProps {
  seoData: SEOData;
  setSeoData: (data: SEOData) => void;
  onSave: () => void;
}

const SEOSettingsTab = ({ seoData, setSeoData, onSave }: SEOSettingsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO & Meta Tags</CardTitle>
        <CardDescription>
          Control your site's search engine optimization and social media appearance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="siteTitle">Site Title (Browser Tab)</Label>
          <Input
            id="siteTitle"
            value={seoData.siteTitle}
            onChange={(e) => setSeoData({ ...seoData, siteTitle: e.target.value })}
            placeholder="Your site title"
          />
        </div>

        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={seoData.metaDescription}
            onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
            placeholder="Description for search engines"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="ogTitle">Open Graph Title (Social Media)</Label>
          <Input
            id="ogTitle"
            value={seoData.ogTitle}
            onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
            placeholder="Leave empty to use site title"
          />
        </div>

        <div>
          <Label htmlFor="ogDescription">Open Graph Description</Label>
          <Textarea
            id="ogDescription"
            value={seoData.ogDescription}
            onChange={(e) => setSeoData({ ...seoData, ogDescription: e.target.value })}
            placeholder="Leave empty to use meta description"
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="ogImage">Open Graph Image URL</Label>
          <Input
            id="ogImage"
            value={seoData.ogImage}
            onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <Label htmlFor="favicon">Favicon URL</Label>
          <Input
            id="favicon"
            value={seoData.favicon}
            onChange={(e) => setSeoData({ ...seoData, favicon: e.target.value })}
            placeholder="/lovable-uploads/your-favicon.png"
          />
        </div>

        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save SEO Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default SEOSettingsTab;
