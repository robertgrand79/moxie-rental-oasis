
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import NewsletterTemplate from './NewsletterTemplate';
import { parseContentToSections, generatePreheader, enhanceWithImages } from './NewsletterContentParser';

interface NewsletterPreviewPanelProps {
  subject: string;
  content: string;
  viewMode: 'desktop' | 'mobile';
}

const NewsletterPreviewPanel = ({ subject, content, viewMode }: NewsletterPreviewPanelProps) => {
  const sections = useMemo(() => 
    enhanceWithImages(parseContentToSections(content, subject)), 
    [content, subject]
  );
  
  const preheader = useMemo(() => 
    generatePreheader(subject, content), 
    [subject, content]
  );

  const isEmpty = !subject && !content;

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
                <span>From: Moxie Vacation Rentals</span>
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
        )}
        
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-800">
            ✨ This preview updates automatically as you type. The final newsletter will include 
            professional Moxie branding and responsive design for all email clients.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterPreviewPanel;
