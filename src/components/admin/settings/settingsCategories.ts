
import { Settings, Palette, Globe, Code } from 'lucide-react';

export const createSettingsCategories = (siteData: any, seoData: any, analyticsData: any, mapboxToken: string) => [
  {
    id: 'general',
    title: 'General Settings',
    description: 'Basic site information and preferences',
    icon: Settings,
    color: 'bg-blue-100 text-blue-700',
    settings: [
      { 
        name: 'Site Information', 
        description: 'Site name, tagline, and description', 
        status: siteData.siteName ? 'configured' : 'needs-setup',
        key: 'site-info'
      },
      { 
        name: 'Hero Section', 
        description: 'Homepage hero content and images', 
        status: siteData.heroTitle ? 'configured' : 'needs-setup',
        key: 'hero-section'
      },
      { 
        name: 'Contact Information', 
        description: 'Phone, email, address, and social media', 
        status: siteData.contactEmail ? 'configured' : 'needs-setup',
        key: 'contact-info'
      }
    ]
  },
  {
    id: 'appearance',
    title: 'Appearance & Branding',
    description: 'Colors, fonts, logo, and visual design',
    icon: Palette,
    color: 'bg-purple-100 text-purple-700',
    settings: [
      { 
        name: 'Design & Branding', 
        description: 'Colors, fonts, and visual elements', 
        status: 'configured',
        key: 'design-branding'
      }
    ]
  },
  {
    id: 'seo',
    title: 'SEO & Analytics',
    description: 'Search optimization and tracking',
    icon: Globe,
    color: 'bg-green-100 text-green-700',
    settings: [
      { 
        name: 'SEO Settings', 
        description: 'Meta tags and search optimization', 
        status: seoData.siteTitle ? 'configured' : 'needs-setup',
        key: 'seo-settings'
      },
      { 
        name: 'Analytics', 
        description: 'Google Analytics and tracking codes', 
        status: analyticsData.googleAnalyticsId ? 'configured' : 'needs-setup',
        key: 'analytics-settings'
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations & APIs',
    description: 'Third-party services and connections',
    icon: Code,
    color: 'bg-orange-100 text-orange-700',
    settings: [
      { 
        name: 'Email Services', 
        description: 'SendGrid for newsletters and transactional emails', 
        status: 'needs-setup',
        key: 'email-services'
      },
      { 
        name: 'Maps Integration', 
        description: 'Mapbox for location features', 
        status: mapboxToken ? 'configured' : 'needs-setup',
        key: 'maps-settings'
      },
      { 
        name: 'Advanced Settings', 
        description: 'Custom CSS and JavaScript', 
        status: 'configured',
        key: 'advanced-settings'
      }
    ]
  }
];
