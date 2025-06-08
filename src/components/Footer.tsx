
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, MapPinIcon } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { getSetting, loading, refetch } = useSiteSettings();

  // Refetch settings on mount and when component receives focus
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    
    // Also refetch when the component mounts
    if (!loading) {
      refetch();
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch, loading]);

  // Don't render footer until settings are loaded
  if (loading) {
    return null;
  }

  const siteData = {
    siteName: getSetting('siteName', 'Moxie Vacation Rentals'),
    description: getSetting('description', 'Your home base for living like a local in Eugene, Oregon. Thoughtfully curated vacation rentals in the heart of the Pacific Northwest.'),
    contactEmail: getSetting('contactEmail', 'hello@moxievacationrentals.com'),
    phone: getSetting('phone', '(541) 555-0123'),
    address: getSetting('address', 'Eugene, Oregon'),
    socialMedia: getSetting('socialMedia', {
      facebook: '',
      instagram: '',
      twitter: '',
      googlePlaces: ''
    })
  };

  return (
    <footer className="bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to text-foreground relative">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-6 text-primary">{siteData.siteName}</h3>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              {siteData.description}
            </p>
            <div className="flex space-x-4">
              {siteData.socialMedia.facebook && (
                <a 
                  href={siteData.socialMedia.facebook} 
                  className="group p-2 rounded-lg bg-background/50 hover:bg-background transition-all duration-300 hover:scale-110 hover:shadow-md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5 text-icon-blue group-hover:text-primary transition-colors duration-200" />
                </a>
              )}
              {siteData.socialMedia.instagram && (
                <a 
                  href={siteData.socialMedia.instagram} 
                  className="group p-2 rounded-lg bg-background/50 hover:bg-background transition-all duration-300 hover:scale-110 hover:shadow-md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5 text-icon-rose group-hover:text-primary transition-colors duration-200" />
                </a>
              )}
              {siteData.socialMedia.twitter && (
                <a 
                  href={siteData.socialMedia.twitter} 
                  className="group p-2 rounded-lg bg-background/50 hover:bg-background transition-all duration-300 hover:scale-110 hover:shadow-md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5 text-icon-blue group-hover:text-primary transition-colors duration-200" />
                </a>
              )}
              {siteData.socialMedia.googlePlaces && (
                <a 
                  href={siteData.socialMedia.googlePlaces} 
                  className="group p-2 rounded-lg bg-background/50 hover:bg-background transition-all duration-300 hover:scale-110 hover:shadow-md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Google Places"
                >
                  <MapPinIcon className="h-5 w-5 text-icon-emerald group-hover:text-primary transition-colors duration-200" />
                </a>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-center group">
                <div className="p-2 mr-4 rounded-lg bg-background/30 group-hover:bg-background/50 transition-colors duration-200">
                  <MapPin className="h-5 w-5 text-icon-blue" />
                </div>
                <span className="text-muted-foreground">{siteData.address}</span>
              </div>
              <div className="flex items-center group">
                <div className="p-2 mr-4 rounded-lg bg-background/30 group-hover:bg-background/50 transition-colors duration-200">
                  <Phone className="h-5 w-5 text-icon-emerald" />
                </div>
                <a 
                  href={`tel:${siteData.phone}`}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {siteData.phone}
                </a>
              </div>
              <div className="flex items-center group">
                <div className="p-2 mr-4 rounded-lg bg-background/30 group-hover:bg-background/50 transition-colors duration-200">
                  <Mail className="h-5 w-5 text-icon-amber" />
                </div>
                <a 
                  href={`mailto:${siteData.contactEmail}`}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {siteData.contactEmail}
                </a>
              </div>
              <div className="flex items-center group">
                <div className="p-2 mr-4 rounded-lg bg-background/30 group-hover:bg-background/50 transition-colors duration-200">
                  <Clock className="h-5 w-5 text-icon-purple" />
                </div>
                <span className="text-muted-foreground">24/7 Guest Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/listings" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  View Properties
                </Link>
              </li>
              <li>
                <Link 
                  to="/experiences" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  Local Experiences
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 relative inline-block after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-primary after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Visual Separator */}
        <div className="my-12">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2024 {siteData.siteName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 justify-center md:justify-end">
            <Link 
              to="/privacy" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link 
              to="/faq" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              FAQ
            </Link>
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
