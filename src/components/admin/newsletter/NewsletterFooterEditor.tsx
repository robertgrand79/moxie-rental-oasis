import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface FooterConfig {
  company_name: string;
  tagline: string;
  contact_info: {
    email: string;
    location: string;
  };
  links: Array<{
    text: string;
    url: string;
  }>;
  legal_links: Array<{
    text: string;
    url: string;
  }>;
  social_media: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}

interface NewsletterFooterEditorProps {
  footerConfig: FooterConfig;
  onFooterConfigChange: (config: FooterConfig) => void | Promise<boolean>;
  disabled?: boolean;
}

const NewsletterFooterEditor = ({ footerConfig, onFooterConfigChange, disabled = false }: NewsletterFooterEditorProps) => {
  
  const handleInputChange = (field: keyof FooterConfig, value: any) => {
    onFooterConfigChange({
      ...footerConfig,
      [field]: value
    });
  };

  const handleContactInfoChange = (field: keyof FooterConfig['contact_info'], value: string) => {
    onFooterConfigChange({
      ...footerConfig,
      contact_info: {
        ...footerConfig.contact_info,
        [field]: value
      }
    });
  };

  const handleSocialMediaChange = (field: keyof FooterConfig['social_media'], value: string) => {
    onFooterConfigChange({
      ...footerConfig,
      social_media: {
        ...footerConfig.social_media,
        [field]: value
      }
    });
  };

  const addLink = (type: 'links' | 'legal_links') => {
    onFooterConfigChange({
      ...footerConfig,
      [type]: [...footerConfig[type], { text: '', url: '' }]
    });
  };

  const updateLink = (type: 'links' | 'legal_links', index: number, field: 'text' | 'url', value: string) => {
    const updatedLinks = [...footerConfig[type]];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    onFooterConfigChange({
      ...footerConfig,
      [type]: updatedLinks
    });
  };

  const removeLink = (type: 'links' | 'legal_links', index: number) => {
    const updatedLinks = footerConfig[type].filter((_, i) => i !== index);
    onFooterConfigChange({
      ...footerConfig,
      [type]: updatedLinks
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Newsletter Footer</CardTitle>
        <CardDescription>
          Configure your newsletter footer with contact info and legal links
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={footerConfig.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Your Business Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={footerConfig.tagline}
              onChange={(e) => handleInputChange('tagline', e.target.value)}
              placeholder="Your business tagline"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Contact Information</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={footerConfig.contact_info.email}
                onChange={(e) => handleContactInfoChange('email', e.target.value)}
                placeholder="contact@yourdomain.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-location">Location</Label>
              <Input
                id="contact-location"
                value={footerConfig.contact_info.location}
                onChange={(e) => handleContactInfoChange('location', e.target.value)}
                placeholder="Your City, State"
              />
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Navigation Links</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addLink('links')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
          <div className="space-y-3">
            {footerConfig.links.map((link, index) => (
              <div key={index} className="flex gap-3 items-center">
                <Input
                  placeholder="Link text"
                  value={link.text}
                  onChange={(e) => updateLink('links', index, 'text', e.target.value)}
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink('links', index, 'url', e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLink('links', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Links */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Legal Links</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addLink('legal_links')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Link
            </Button>
          </div>
          <div className="space-y-3">
            {footerConfig.legal_links.map((link, index) => (
              <div key={index} className="flex gap-3 items-center">
                <Input
                  placeholder="Link text"
                  value={link.text}
                  onChange={(e) => updateLink('legal_links', index, 'text', e.target.value)}
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => updateLink('legal_links', index, 'url', e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLink('legal_links', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Social Media</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={footerConfig.social_media.facebook}
                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                placeholder="Facebook URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={footerConfig.social_media.instagram}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                placeholder="Instagram URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={footerConfig.social_media.twitter}
                onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                placeholder="Twitter URL"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterFooterEditor;