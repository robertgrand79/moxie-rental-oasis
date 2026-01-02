/**
 * Platform Footer Component
 * 
 * Public-facing footer with dark theme matching the marketing site.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Twitter, Linkedin, Youtube, Mail } from 'lucide-react';
import { usePlatform } from '@/contexts/PlatformContext';

const PlatformFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { isPlatformSite } = usePlatform();
  const location = useLocation();
  
  // Determine if we're in /platform/* context on a tenant domain
  const isInPlatformPath = location.pathname.startsWith('/platform');
  const pathPrefix = isPlatformSite ? '' : (isInPlatformPath ? '/platform' : '');

  const footerLinks = {
    product: [
      { label: 'Features', href: `${pathPrefix}/#features` },
      { label: 'Pricing', href: `${pathPrefix}/#pricing` },
      { label: 'FAQ', href: `${pathPrefix}/#faq` },
    ],
    company: [
      { label: 'About', href: `${pathPrefix}/about` },
      { label: 'Blog', href: `${pathPrefix}/blog` },
      { label: 'Contact', href: `${pathPrefix}/contact` },
    ],
    legal: [
      { label: 'Privacy Policy', href: `${pathPrefix}/privacy` },
      { label: 'Terms of Service', href: `${pathPrefix}/terms` },
    ],
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to={pathPrefix || '/'} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white font-fraunces">
                StayMoxie
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              All-in-one vacation rental software for direct bookings and local market dominance.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="mailto:hello@staymoxie.com" className="text-gray-500 hover:text-blue-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} StayMoxie. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made with ❤️ for vacation rental hosts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PlatformFooter;
