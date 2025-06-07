
import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const [siteData, setSiteData] = useState({
    siteName: 'Moxie Vacation Rentals',
    description: 'Your home base for living like a local in Eugene, Oregon. Thoughtfully curated vacation rentals in the heart of the Pacific Northwest.',
    contactEmail: 'hello@moxievacationrentals.com',
    phone: '(541) 555-0123',
    address: 'Eugene, Oregon',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  useEffect(() => {
    // Load site settings from localStorage
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSiteData({
        siteName: settings.siteName || 'Moxie Vacation Rentals',
        description: settings.description || 'Your home base for living like a local in Eugene, Oregon. Thoughtfully curated vacation rentals in the heart of the Pacific Northwest.',
        contactEmail: settings.contactEmail || 'hello@moxievacationrentals.com',
        phone: settings.phone || '(541) 555-0123',
        address: settings.address || 'Eugene, Oregon',
        socialMedia: settings.socialMedia || {
          facebook: '',
          instagram: '',
          twitter: ''
        }
      });
    }
  }, []);

  return (
    <footer className="text-white py-16" style={{ backgroundColor: '#767b8d' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-6">{siteData.siteName}</h3>
            <p className="mb-4 leading-relaxed" style={{ color: '#ececec' }}>
              {siteData.description}
            </p>
            <div className="flex space-x-4">
              {siteData.socialMedia.facebook && (
                <a href={siteData.socialMedia.facebook} className="hover:text-white transition-colors" style={{ color: '#cbcfd2' }} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {siteData.socialMedia.instagram && (
                <a href={siteData.socialMedia.instagram} className="hover:text-white transition-colors" style={{ color: '#cbcfd2' }} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {siteData.socialMedia.twitter && (
                <a href={siteData.socialMedia.twitter} className="hover:text-white transition-colors" style={{ color: '#cbcfd2' }} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3" style={{ color: '#cbcfd2' }} />
                <span style={{ color: '#ececec' }}>{siteData.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3" style={{ color: '#cbcfd2' }} />
                <span style={{ color: '#ececec' }}>{siteData.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3" style={{ color: '#cbcfd2' }} />
                <span style={{ color: '#ececec' }}>{siteData.contactEmail}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3" style={{ color: '#cbcfd2' }} />
                <span style={{ color: '#ececec' }}>24/7 Guest Support</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/listings" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  View Properties
                </a>
              </li>
              <li>
                <a href="/experiences" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  Local Experiences
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  About Us
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  Guest Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xl font-bold mb-6">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  Booking Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  House Rules
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" style={{ color: '#ececec' }}>
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8" style={{ borderTop: `1px solid #8b929a` }}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0" style={{ color: '#cbcfd2' }}>
              © 2024 {siteData.siteName}. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#cbcfd2' }}>
                Privacy Policy
              </a>
              <a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#cbcfd2' }}>
                Terms of Service
              </a>
              <a href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#cbcfd2' }}>
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
