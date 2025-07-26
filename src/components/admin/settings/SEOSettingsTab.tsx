
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import SEOImageUpload from './SEOImageUpload';
import SEOPreview from './SEOPreview';

interface SEOData {
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
}

const SEOSettingsTab = () => {
  const { settings, saveSetting } = useSimplifiedSiteSettings();
  const [seoData, setSeoData] = React.useState<SEOData>({
    siteTitle: '',
    metaDescription: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    favicon: ''
  });

  // Load existing settings when component mounts or settings change
  React.useEffect(() => {
    if (settings) {
      setSeoData({
        siteTitle: settings.siteTitle || '',
        metaDescription: settings.metaDescription || '',
        ogTitle: settings.ogTitle || '',
        ogDescription: settings.ogDescription || '',
        ogImage: settings.ogImage || '',
        favicon: settings.favicon || ''
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const promises = Object.entries(seoData).map(([key, value]) => 
      saveSetting(key, value)
    );
    await Promise.all(promises);
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
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

            <div className="space-y-3">
              <Label htmlFor="ogImage">Open Graph Image</Label>
              <Input
                id="ogImage"
                value={seoData.ogImage}
                onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
                placeholder="https://example.com/image.jpg or upload below"
              />
              <SEOImageUpload
                imageUrl={seoData.ogImage}
                onImageChange={(url) => setSeoData({ ...seoData, ogImage: url })}
                type="og"
                label="Open Graph Image"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="favicon">Favicon</Label>
              <Input
                id="favicon"
                value={seoData.favicon}
                onChange={(e) => setSeoData({ ...seoData, favicon: e.target.value })}
                placeholder="/lovable-uploads/your-favicon.png or upload below"
              />
              <SEOImageUpload
                imageUrl={seoData.favicon}
                onImageChange={(url) => setSeoData({ ...seoData, favicon: url })}
                type="favicon"
                label="Favicon"
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save SEO Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <SEOPreview
          siteTitle={seoData.siteTitle}
          metaDescription={seoData.metaDescription}
          ogTitle={seoData.ogTitle}
          ogDescription={seoData.ogDescription}
          ogImage={seoData.ogImage}
          favicon={seoData.favicon}
        />
      </div>
    </div>
  );
};

export default SEOSettingsTab;
