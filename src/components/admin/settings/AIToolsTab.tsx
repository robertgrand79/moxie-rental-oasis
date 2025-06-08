
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Sparkles, Bot } from 'lucide-react';
import AIContentGenerators from '@/components/admin/AIContentGenerators';
import AIDataEnhancer from '@/components/admin/AIDataEnhancer';
import AISiteEditor from '@/components/AISiteEditor';

interface AIToolsTabProps {
  siteData: any;
  setSiteData: (data: any) => void;
}

const AIToolsTab = ({ siteData, setSiteData }: AIToolsTabProps) => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle>AI-Powered Tools</EnhancedCardTitle>
        <EnhancedCardDescription>
          Use artificial intelligence to generate and enhance your content
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Content Generator</span>
            </TabsTrigger>
            <TabsTrigger value="enhancer" className="flex items-center space-x-2">
              <Wand2 className="h-4 w-4" />
              <span>Data Enhancer</span>
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>AI Site Editor</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <AIContentGenerators />
          </TabsContent>

          <TabsContent value="enhancer">
            <AIDataEnhancer />
          </TabsContent>

          <TabsContent value="editor">
            <AISiteEditor siteData={siteData} onUpdateSiteData={setSiteData} />
          </TabsContent>
        </Tabs>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default AIToolsTab;
