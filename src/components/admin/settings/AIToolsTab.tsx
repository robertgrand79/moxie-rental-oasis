
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import UnifiedAIChat from '@/components/admin/UnifiedAIChat';

interface AIToolsTabProps {
  siteData: any;
  setSiteData: (data: any) => void;
}

const AIToolsTab = ({ siteData, setSiteData }: AIToolsTabProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle>AI Assistant</EnhancedCardTitle>
        <EnhancedCardDescription>
          Chat with AI to generate and manage all your content naturally
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <UnifiedAIChat />
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default AIToolsTab;
