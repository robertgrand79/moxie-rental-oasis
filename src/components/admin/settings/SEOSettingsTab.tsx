
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import SEOImageUpload from './SEOImageUpload';
import SEOPreview from './SEOPreview';
import AIGenerateButton from './AIGenerateButton';
import AIContentModal from './AIContentModal';

interface SEOData {
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
}

const AI_PROMPTS = {
  siteTitle: {
    label: 'Site Title',
    prompt: 'Generate an SEO-optimized site title for a vacation rental website. Keep it under 60 characters, brandable, and include relevant keywords.',
  },
  metaDescription: {
    label: 'Meta Description',
    prompt: 'Write a compelling meta description for a vacation rental website. Keep it under 160 characters, include key benefits, and encourage clicks from search results.',
  },
  ogTitle: {
    label: 'Social Media Title',
    prompt: 'Create an engaging Open Graph title for social media sharing. Make it attention-grabbing and under 60 characters.',
  },
  ogDescription: {
    label: 'Social Media Description',
    prompt: 'Write a compelling Open Graph description for social media sharing. Focus on what makes the vacation rentals unique and invite engagement. Keep it under 200 characters.',
  },
};

type AIPromptField = keyof typeof AI_PROMPTS;

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
  const [aiModal, setAiModal] = useState<{ open: boolean; field: AIPromptField | null }>({
    open: false,
    field: null,
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

  const openAiModal = (field: AIPromptField) => {
    setAiModal({ open: true, field });
  };

  const handleApplyContent = (content: string) => {
    if (aiModal.field) {
      setSeoData({ ...seoData, [aiModal.field]: content });
    }
  };

  return (
    <>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="siteTitle">Site Title (Browser Tab)</Label>
                  <AIGenerateButton 
                    onClick={() => openAiModal('siteTitle')}
                    tooltip="Generate title with AI"
                  />
                </div>
                <Input
                  id="siteTitle"
                  value={seoData.siteTitle}
                  onChange={(e) => setSeoData({ ...seoData, siteTitle: e.target.value })}
                  placeholder="Your site title"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <AIGenerateButton 
                    onClick={() => openAiModal('metaDescription')}
                    tooltip="Generate description with AI"
                  />
                </div>
                <Textarea
                  id="metaDescription"
                  value={seoData.metaDescription}
                  onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                  placeholder="Description for search engines"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ogTitle">Open Graph Title (Social Media)</Label>
                  <AIGenerateButton 
                    onClick={() => openAiModal('ogTitle')}
                    tooltip="Generate social title with AI"
                  />
                </div>
                <Input
                  id="ogTitle"
                  value={seoData.ogTitle}
                  onChange={(e) => setSeoData({ ...seoData, ogTitle: e.target.value })}
                  placeholder="Leave empty to use site title"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ogDescription">Open Graph Description</Label>
                  <AIGenerateButton 
                    onClick={() => openAiModal('ogDescription')}
                    tooltip="Generate social description with AI"
                  />
                </div>
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

      {/* AI Generation Modal */}
      {aiModal.field && (
        <AIContentModal
          open={aiModal.open}
          onOpenChange={(open) => setAiModal({ ...aiModal, open })}
          fieldName={aiModal.field}
          fieldLabel={AI_PROMPTS[aiModal.field].label}
          contextPrompt={AI_PROMPTS[aiModal.field].prompt}
          currentValue={seoData[aiModal.field]}
          onApply={handleApplyContent}
        />
      )}
    </>
  );
};

export default SEOSettingsTab;
