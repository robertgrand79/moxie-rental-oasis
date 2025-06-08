
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Phone, Clock, Facebook, Instagram, Twitter, MapPinIcon, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ContactInformationSettingsProps {
  siteData: any;
  onInputChange: (field: string, value: string) => void;
  onSocialMediaChange: (platform: string, value: string) => void;
}

const ContactInformationSettings = ({ siteData, onInputChange, onSocialMediaChange }: ContactInformationSettingsProps) => {
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Optional fields
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2 text-green-600" />
          Contact Information
        </EnhancedCardTitle>
        <EnhancedCardDescription>
          Configure your business contact details and social media presence. These settings control what appears in your website footer.
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <Input
              id="contactEmail"
              type="email"
              value={siteData.contactEmail || ''}
              onChange={(e) => onInputChange('contactEmail', e.target.value)}
              placeholder="contact@yoursite.com"
              className={`mt-1 ${siteData.contactEmail && !validateEmail(siteData.contactEmail) ? 'border-red-500' : ''}`}
            />
            {siteData.contactEmail && !validateEmail(siteData.contactEmail) && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={siteData.phone || ''}
              onChange={(e) => onInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={`mt-1 ${siteData.phone && !validatePhone(siteData.phone) ? 'border-red-500' : ''}`}
            />
            {siteData.phone && !validatePhone(siteData.phone) && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid phone number</p>
            )}
          </div>
          <div>
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              value={siteData.address || ''}
              onChange={(e) => onInputChange('address', e.target.value)}
              placeholder="123 Main St, City, State"
              className="mt-1"
            />
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-lg font-semibold mb-4">Social Media Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                value={siteData.socialMedia?.facebook || ''}
                onChange={(e) => onSocialMediaChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className={`mt-1 ${siteData.socialMedia?.facebook && !validateUrl(siteData.socialMedia.facebook) ? 'border-red-500' : ''}`}
              />
              {siteData.socialMedia?.facebook && !validateUrl(siteData.socialMedia.facebook) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
              )}
            </div>
            <div>
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                value={siteData.socialMedia?.instagram || ''}
                onChange={(e) => onSocialMediaChange('instagram', e.target.value)}
                placeholder="https://instagram.com/youraccount"
                className={`mt-1 ${siteData.socialMedia?.instagram && !validateUrl(siteData.socialMedia.instagram) ? 'border-red-500' : ''}`}
              />
              {siteData.socialMedia?.instagram && !validateUrl(siteData.socialMedia.instagram) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
              )}
            </div>
            <div>
              <Label htmlFor="twitter">Twitter URL</Label>
              <Input
                id="twitter"
                value={siteData.socialMedia?.twitter || ''}
                onChange={(e) => onSocialMediaChange('twitter', e.target.value)}
                placeholder="https://twitter.com/youraccount"
                className={`mt-1 ${siteData.socialMedia?.twitter && !validateUrl(siteData.socialMedia.twitter) ? 'border-red-500' : ''}`}
              />
              {siteData.socialMedia?.twitter && !validateUrl(siteData.socialMedia.twitter) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
              )}
            </div>
            <div>
              <Label htmlFor="googlePlaces">Google Places URL</Label>
              <Input
                id="googlePlaces"
                value={siteData.socialMedia?.googlePlaces || ''}
                onChange={(e) => onSocialMediaChange('googlePlaces', e.target.value)}
                placeholder="https://maps.google.com/yourplace"
                className={`mt-1 ${siteData.socialMedia?.googlePlaces && !validateUrl(siteData.socialMedia.googlePlaces) ? 'border-red-500' : ''}`}
              />
              {siteData.socialMedia?.googlePlaces && !validateUrl(siteData.socialMedia.googlePlaces) && (
                <p className="text-xs text-red-500 mt-1">Please enter a valid URL</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-600" />
            Footer Preview
          </h4>
          <div className="bg-gray-50 rounded-lg p-6 border">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-2 mr-4 rounded-lg bg-blue-100">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">
                  {siteData.address || 'No address set'}
                </span>
              </div>
              <div className="flex items-center">
                <div className="p-2 mr-4 rounded-lg bg-green-100">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">
                  {siteData.phone || 'No phone number set'}
                </span>
              </div>
              <div className="flex items-center">
                <div className="p-2 mr-4 rounded-lg bg-amber-100">
                  <Mail className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm text-gray-700">
                  {siteData.contactEmail || 'No email set'}
                </span>
              </div>
              <div className="flex items-center">
                <div className="p-2 mr-4 rounded-lg bg-purple-100">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">24/7 Guest Support</span>
              </div>
              <div className="flex space-x-2 mt-4">
                {siteData.socialMedia?.facebook && (
                  <div className="p-2 rounded bg-blue-100">
                    <Facebook className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                {siteData.socialMedia?.instagram && (
                  <div className="p-2 rounded bg-pink-100">
                    <Instagram className="h-4 w-4 text-pink-600" />
                  </div>
                )}
                {siteData.socialMedia?.twitter && (
                  <div className="p-2 rounded bg-blue-100">
                    <Twitter className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                {siteData.socialMedia?.googlePlaces && (
                  <div className="p-2 rounded bg-green-100">
                    <MapPinIcon className="h-4 w-4 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This preview shows how your contact information will appear in the website footer.
          </p>
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default ContactInformationSettings;
