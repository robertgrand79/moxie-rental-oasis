
import React from 'react';
import NewsletterTemplate from './NewsletterTemplate';

interface NewsletterSection {
  type: 'hero' | 'content' | 'property' | 'events' | 'cta' | 'image';
  title?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
}

interface NewsletterEmailClientProps {
  subject: string;
  preheader?: string;
  sections: NewsletterSection[];
  viewMode: 'desktop' | 'mobile';
}

const NewsletterEmailClient = ({ subject, preheader, sections, viewMode }: NewsletterEmailClientProps) => {
  return (
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
  );
};

export default NewsletterEmailClient;
