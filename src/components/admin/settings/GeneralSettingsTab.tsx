
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface GeneralSettingsTabProps {
  siteData: {
    siteName: string;
    tagline: string;
    description: string;
    contactEmail: string;
    phone: string;
    address: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
}

const GeneralSettingsTab = ({ siteData, onInputChange, onSave }: GeneralSettingsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure your site's basic information and content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={siteData.siteName}
              onChange={(e) => onInputChange('siteName', e.target.value)}
              placeholder="Your site name"
            />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={siteData.tagline}
              onChange={(e) => onInputChange('tagline', e.target.value)}
              placeholder="A short tagline"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Site Description</Label>
          <Textarea
            id="description"
            value={siteData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Describe your business"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={siteData.contactEmail}
              onChange={(e) => onInputChange('contactEmail', e.target.value)}
              placeholder="contact@yoursite.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={siteData.phone}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={siteData.address}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="Your business address"
            />
          </div>
        </div>

        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save General Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default GeneralSettingsTab;
