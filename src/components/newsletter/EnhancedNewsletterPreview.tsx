
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Smartphone, Monitor } from 'lucide-react';
import NewsletterTemplate from './NewsletterTemplate';
import { parseContentToSections, generatePreheader, enhanceWithImages } from './NewsletterContentParser';

interface EnhancedNewsletterPreviewProps {
  subject: string;
  content: string;
}

const EnhancedNewsletterPreview = ({ subject, content }: EnhancedNewsletterPreviewProps) => {
  const [viewMode, setViewMode] = React.useState<'desktop' | 'mobile'>('desktop');
  
  const sections = enhanceWithImages(parseContentToSections(content, subject));
  const preheader = generatePreheader(subject, content);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Enhanced Newsletter Preview
            </CardTitle>
            <CardDescription>
              See your newsletter with Moxie's professional design and branding
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="h-4 w-4 mr-1" />
              Desktop
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="h-4 w-4 mr-1" />
              Mobile
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-gray-50">
          {/* Email Client Header */}
          <div className="bg-white border-b px-4 py-3 text-sm">
            <div className="flex justify-between items-center text-gray-600">
              <span>From: Moxie Vacation Rentals &lt;newsletter@moxievacationrentals.com&gt;</span>
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
              <NewsletterTemplate
                subject={subject}
                sections={sections}
                preheader={preheader}
              />
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Enhanced with Moxie Design</h4>
              <p className="text-sm text-gray-600 mt-1">
                Your newsletter now includes branded headers, responsive design, property showcases, 
                and professional styling that reflects Moxie's Eugene-focused vacation rental expertise.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsletterPreview;
