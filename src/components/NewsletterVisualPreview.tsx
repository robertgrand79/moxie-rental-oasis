import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { useGlobalNewsletterSettings } from '@/hooks/useGlobalNewsletterSettings';

interface NewsletterVisualPreviewProps {
  subject: string;
  content: string;
}

const NewsletterVisualPreview = ({ subject, content }: NewsletterVisualPreviewProps) => {
  const { settings } = useTenantSettings();
  const { settings: newsletterSettings } = useGlobalNewsletterSettings();
  
  // Use newsletter-specific settings if configured, otherwise fall back to site settings
  const headerConfig = newsletterSettings.headerConfig;
  const logoUrl = headerConfig.logo_url || settings?.logo_url;
  const siteName = headerConfig.title || settings?.site_name || 'Your Business';
  const tagline = headerConfig.subtitle || settings?.heroSubtitle || 'Your trusted destination';

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Visual Preview
        </CardTitle>
        <CardDescription>
          Preview how your newsletter will look in the recipient's inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          {/* Email Header Preview */}
          <div className="bg-gray-100 border-b px-4 py-2 text-sm">
            <div className="flex justify-between items-center text-gray-600">
              <span>From: {siteName} &lt;noreply@yourdomain.com&gt;</span>
              <span>📧</span>
            </div>
            <div className="font-semibold text-gray-800 mt-1">
              Subject: {subject || 'Your Newsletter Subject...'}
            </div>
          </div>

          {/* Email Content Preview */}
          <div className="max-w-[600px] mx-auto bg-white">
            {/* Header with modern gradient */}
            <div 
              className="text-white p-8 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${headerConfig.background_gradient.from} 0%, ${headerConfig.background_gradient.to} 100%)`,
                color: headerConfig.text_color
              }}
            >
              <div className="relative z-10">
                {logoUrl ? (
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <img 
                      src={logoUrl} 
                      alt={siteName}
                      className="h-10 w-auto"
                    />
                    <h1 className="text-2xl font-bold m-0" style={{ color: headerConfig.text_color }}>{siteName}</h1>
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold m-0" style={{ color: headerConfig.text_color }}>{siteName}</h1>
                )}
                <p className="mt-3 mb-0 font-medium opacity-80" style={{ color: headerConfig.text_color }}>{tagline}</p>
              </div>
              {/* Subtle accent overlay */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(45deg, transparent 0%, hsl(220, 6%, 88%) 50%, transparent 100%)'
                }}
              />
            </div>
            
            {/* Content Area */}
            <div className="p-8 bg-white">
              <h2 className="text-gray-800 text-xl font-semibold mt-0 mb-4">
                {subject || 'Newsletter Title'}
              </h2>
              
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: content || '<p style="color: #666; font-style: italic;">Start writing your newsletter content...</p>' 
                }}
              />
            </div>
            
            {/* Footer */}
            <div className="px-8 pb-8">
              <div className="pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-600 text-sm mb-2">
                  Thanks for subscribing to {siteName}!
                </p>
                <p className="text-gray-500 text-xs">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Unsubscribe</a> | 
                  <a href="#" className="text-gray-500 hover:text-gray-700 ml-1">Visit our website</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterVisualPreview;
