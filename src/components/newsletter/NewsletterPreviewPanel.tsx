
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterPreviewPanelProps {
  subject: string;
  content: string;
  viewMode: 'desktop' | 'mobile';
}

const NewsletterPreviewPanel = ({ subject, content, viewMode }: NewsletterPreviewPanelProps) => {
  // Fetch dynamic site settings for preview
  const { data: siteSettings } = useQuery({
    queryKey: ['newsletter-preview-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['siteName', 'contactEmail', 'phone', 'address', 'socialMedia']);

      if (error) {
        console.error('Error fetching site settings for preview:', error);
        return {};
      }

      return data?.reduce((acc, setting) => {
        if (setting.key === 'socialMedia') {
          try {
            acc[setting.key] = typeof setting.value === 'string' 
              ? JSON.parse(setting.value) 
              : setting.value;
          } catch (parseError) {
            console.warn(`Failed to parse socialMedia setting:`, parseError);
            acc[setting.key] = setting.value;
          }
        } else {
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  const preheader = useMemo(() => {
    // Generate preheader from content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const firstLine = textContent.split('\n')[0]?.trim();
    return firstLine?.substring(0, 100) + '...' || `${subject} - Your Eugene adventure awaits!`;
  }, [subject, content]);

  const isEmpty = !subject && !content;

  // Create the newsletter HTML with dynamic settings
  const generateNewsletterHTML = (subject: string, content: string, preheader: string) => {
    const siteName = siteSettings?.siteName || "Moxie Vacation Rentals";
    const contactEmail = siteSettings?.contactEmail || "contact@moxievacationrentals.com";
    const phone = siteSettings?.phone || "+1 (555) 123-4567";
    const address = siteSettings?.address || "123 Vacation St, Eugene, OR 97401";
    const socialMedia = siteSettings?.socialMedia || {
      facebook: '',
      instagram: '',
      twitter: '',
      googlePlaces: ''
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  line-height: 1.6; 
                  margin: 0; 
                  padding: 0; 
                  background-color: #f8fafc;
              }
              .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background: #ffffff; 
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 40px 30px; 
                  text-align: center; 
              }
              .header h1 { 
                  margin: 0 0 10px 0; 
                  font-size: 28px; 
                  font-weight: bold; 
              }
              .header p { 
                  margin: 0; 
                  opacity: 0.9; 
                  font-size: 16px; 
              }
              .content { 
                  padding: 30px; 
              }
              .content h2 { 
                  color: #333; 
                  font-size: 24px; 
                  margin-bottom: 16px; 
              }
              .content h3 { 
                  color: #333; 
                  font-size: 20px; 
                  margin-bottom: 12px; 
              }
              .content p { 
                  color: #666; 
                  line-height: 1.6; 
                  margin-bottom: 16px; 
              }
              .content ul, .content ol { 
                  color: #666; 
                  padding-left: 20px; 
                  margin-bottom: 16px; 
              }
              .content li { 
                  margin-bottom: 8px; 
              }
              .content strong { 
                  color: #333; 
              }
              .content a { 
                  color: #667eea; 
                  text-decoration: none; 
              }
              .content a:hover { 
                  text-decoration: underline; 
              }
              .footer { 
                  background: #f8fafc; 
                  padding: 30px; 
                  text-align: center; 
                  border-top: 1px solid #e2e8f0; 
              }
              .footer p { 
                  margin: 0 0 10px 0; 
                  color: #666; 
                  font-size: 14px; 
              }
              .footer a { 
                  color: #667eea; 
                  text-decoration: none; 
                  margin: 0 8px; 
              }
              .social-links {
                  margin: 16px 0;
              }
              .social-links a {
                  display: inline-block;
                  margin: 0 8px;
                  color: #667eea;
                  text-decoration: none;
              }
              @media (max-width: 600px) {
                  .header { padding: 30px 20px; }
                  .header h1 { font-size: 24px; }
                  .content { padding: 20px; }
                  .footer { padding: 20px; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              ${preheader ? `<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</div>` : ''}
              
              <div class="header">
                  <h1>${siteName}</h1>
                  <p>Your Home Base for Living Like a Local in Eugene</p>
              </div>
              
              <div class="content">
                  <h2 style="margin-top: 0;">${subject || 'Your Eugene Newsletter'}</h2>
                  <div>${content}</div>
              </div>
              
              <div class="footer">
                  <p><strong>${siteName}</strong></p>
                  <p>Your Home Base for Living Like a Local in Eugene</p>
                  <p>${address} | ${contactEmail}</p>
                  ${phone ? `<p>Phone: ${phone}</p>` : ''}
                  <div class="social-links">
                      <a href="https://moxievacationrentals.com">Visit Our Website</a>
                      <a href="https://moxievacationrentals.com">View Properties</a>
                      ${socialMedia?.facebook ? `<a href="${socialMedia.facebook}">Facebook</a>` : ''}
                      ${socialMedia?.instagram ? `<a href="${socialMedia.instagram}">Instagram</a>` : ''}
                      ${socialMedia?.twitter ? `<a href="${socialMedia.twitter}">Twitter</a>` : ''}
                      ${socialMedia?.googlePlaces ? `<a href="${socialMedia.googlePlaces}">Find Us</a>` : ''}
                  </div>
                  <p style="font-size: 12px;">
                      <a href="#">Unsubscribe</a> | 
                      <a href="#" style="margin-left: 8px;">Update Preferences</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Live Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {viewMode}
            </Badge>
            <Badge variant={isEmpty ? 'secondary' : 'default'}>
              {isEmpty ? 'Empty' : 'Live'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Eye className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">Preview will appear here</p>
            <p className="text-sm">Start typing in the editor to see your newsletter preview</p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            {/* Email Client Header */}
            <div className="bg-white border-b px-4 py-3 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>From: {siteSettings?.siteName || "Moxie Vacation Rentals"}</span>
                <span>📧</span>
              </div>
              <div className="font-semibold text-gray-800 mt-1">
                Subject: {subject || 'Your Eugene Newsletter'}
              </div>
              {preheader && (
                <div className="text-xs text-gray-500 mt-1">
                  {preheader}
                </div>
              )}
            </div>

            {/* Newsletter Content */}
            <div 
              className={`bg-white transition-all duration-300 ${
                viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'max-w-2xl mx-auto'
              }`}
            >
              <div className="max-h-96 overflow-y-auto">
                <div 
                  className="w-full h-full"
                  dangerouslySetInnerHTML={{ 
                    __html: generateNewsletterHTML(subject, content, preheader) 
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-800">
            ✨ This preview shows exactly what your subscribers will receive, using your current contact 
            information from the admin settings. Changes to contact info will automatically appear here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterPreviewPanel;
