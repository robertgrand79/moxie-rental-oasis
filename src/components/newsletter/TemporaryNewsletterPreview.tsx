
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Smartphone, Monitor, AlertCircle } from 'lucide-react';
import NewsletterTemplate from './NewsletterTemplate';
import { parseContentToSections, generatePreheader, enhanceWithImages } from './NewsletterContentParser';

interface TemporaryNewsletterPreviewProps {
  subject: string;
  content: string;
}

const TemporaryNewsletterPreview = ({ subject, content }: TemporaryNewsletterPreviewProps) => {
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
              Newsletter Preview (Visual Only)
            </CardTitle>
            <CardDescription>
              Visual preview of your newsletter with Moxie's professional design
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
      <CardContent className="space-y-6">
        {/* Temporary Notice */}
        <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Send Feature Temporarily Unavailable</h4>
            <p className="text-sm text-yellow-700 mt-1">
              The newsletter send functionality is temporarily disabled due to build issues. 
              You can still preview how your newsletter will look with Moxie's professional design.
            </p>
          </div>
        </div>

        {/* Preview Section */}
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
        
        {/* Enhanced Design Info */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-lg">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Enhanced with Moxie Design</h4>
              <p className="text-sm text-gray-600 mt-1">
                Your newsletter includes branded headers, responsive design, property showcases, 
                and professional styling that reflects Moxie's Eugene-focused vacation rental expertise.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemporaryNewsletterPreview;
