
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface NewsletterVisualPreviewProps {
  subject: string;
  content: string;
}

const NewsletterVisualPreview = ({ subject, content }: NewsletterVisualPreviewProps) => {
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
              <span>From: Moxie Travel Blog &lt;noreply@yourdomain.com&gt;</span>
              <span>📧</span>
            </div>
            <div className="font-semibold text-gray-800 mt-1">
              Subject: {subject || 'Your Newsletter Subject...'}
            </div>
          </div>

          {/* Email Content Preview */}
          <div className="max-w-[600px] mx-auto bg-white">
            {/* Header with gradient */}
            <div 
              className="text-white p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <h1 className="text-3xl font-bold m-0">Moxie Travel Blog</h1>
              <p className="mt-2 mb-0 opacity-90">Your travel inspiration delivered</p>
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
                  Thanks for subscribing to Moxie Travel Blog!
                </p>
                <p className="text-gray-500 text-xs">
                  <a href="#" className="text-gray-500 hover:text-gray-700">Unsubscribe</a> | 
                  <a href="#" className="text-gray-500 hover:text-gray-700 ml-1">Visit our blog</a>
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
