
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import NewsletterPreviewHeader from './NewsletterPreviewHeader';
import NewsletterEmailClient from './NewsletterEmailClient';
import NewsletterDesignInfo from './NewsletterDesignInfo';
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
        <NewsletterPreviewHeader 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <NewsletterEmailClient
          subject={subject}
          preheader={preheader}
          sections={sections}
          viewMode={viewMode}
        />
        
        <NewsletterDesignInfo />
      </CardContent>
    </Card>
  );
};

export default EnhancedNewsletterPreview;
