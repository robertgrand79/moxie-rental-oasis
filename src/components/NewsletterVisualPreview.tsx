
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
            {/* Header with modern gradient */}
            <div 
              className="text-white p-8 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(220, 8%, 85%) 0%, hsl(220, 3%, 97%) 100%)',
                color: 'hsl(222.2, 47.4%, 11.2%)'
              }}
            >
              <div className="relative z-10">
                <h1 className="text-3xl font-bold m-0 text-slate-800">Moxie Vacation Rentals</h1>
                <p className="mt-3 mb-0 text-slate-600 font-medium">Your Home Base for Living Like a Local in Eugene</p>
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
                  Thanks for subscribing to Moxie Vacation Rentals!
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
