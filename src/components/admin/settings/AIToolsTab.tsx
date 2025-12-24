
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';

interface SiteData {
  [key: string]: unknown;
}

interface AIToolsTabProps {
  siteData: SiteData;
  setSiteData: (data: SiteData) => void;
}

const AIToolsTab = ({ }: AIToolsTabProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle>AI Tools</EnhancedCardTitle>
        <EnhancedCardDescription>
          AI tools have been temporarily disabled. Blog AI features are still available in the Blog Management section.
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <div className="text-center py-8 text-gray-500">
          <p>AI tools are currently not available in this section.</p>
          <p className="mt-2">Visit the Blog Management page to access AI-powered blog content generation.</p>
        </div>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default AIToolsTab;
