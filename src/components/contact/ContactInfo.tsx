
import React from 'react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, MapPinIcon } from 'lucide-react';

const ContactInfo = () => {
  const { settings } = useStableSiteSettings();

  const contactEmail = settings.contactEmail || 'gabby@moxievactionrental.com';
  const phone = settings.phone || '+1 541-255-1698';
  const address = settings.address || '2472 Willamette St Eugene OR 97405';
  
  // Ensure socialMedia has proper structure with fallback values
  const socialMedia = settings.socialMedia || {};
  const facebook = socialMedia?.facebook || '';
  const instagram = socialMedia?.instagram || '';
  const twitter = socialMedia?.twitter || '';
  const googlePlaces = socialMedia?.googlePlaces || '';

  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-background rounded-lg p-3">
              <MapPin className="h-6 w-6 text-icon-blue" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Address</h3>
              <p className="text-muted-foreground">{address}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-background rounded-lg p-3">
              <Phone className="h-6 w-6 text-icon-emerald" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Phone</h3>
              <a 
                href={`tel:${phone}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {phone}
              </a>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-background rounded-lg p-3">
              <Mail className="h-6 w-6 text-icon-amber" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Email</h3>
              <a 
                href={`mailto:${contactEmail}`}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {contactEmail}
              </a>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-background rounded-lg p-3">
              <Clock className="h-6 w-6 text-icon-purple" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Support Hours</h3>
              <p className="text-muted-foreground">24/7 Guest Support</p>
              <p className="text-sm text-muted-foreground">Office: Mon-Fri 9AM-5PM PST</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Social Media */}
      <div className="bg-card rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-bold mb-4">Follow Us</h3>
        <div className="flex space-x-4">
          {facebook && (
            <a 
              href={facebook} 
              className="bg-background hover:bg-muted p-3 rounded-lg transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6 text-icon-blue" />
            </a>
          )}
          {instagram && (
            <a 
              href={instagram} 
              className="bg-background hover:bg-muted p-3 rounded-lg transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6 text-icon-rose" />
            </a>
          )}
          {twitter && (
            <a 
              href={twitter} 
              className="bg-background hover:bg-muted p-3 rounded-lg transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Twitter className="h-6 w-6 text-icon-blue" />
            </a>
          )}
          {googlePlaces && (
            <a 
              href={googlePlaces} 
              className="bg-background hover:bg-muted p-3 rounded-lg transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Google Places"
            >
              <MapPinIcon className="h-6 w-6 text-icon-emerald" />
            </a>
          )}
        </div>
      </div>
      
      {/* Business Hours */}
      <div className="bg-card rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-bold mb-4">Business Hours</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monday - Friday</span>
            <span className="font-medium">9:00 AM - 5:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Saturday</span>
            <span className="font-medium">10:00 AM - 3:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sunday</span>
            <span className="font-medium">Closed</span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guest Support</span>
              <span className="font-medium text-primary">24/7 Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
