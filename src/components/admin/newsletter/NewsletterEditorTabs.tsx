import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Layout, Settings } from 'lucide-react';
import TipTapNewsletterEditor from './TipTapNewsletterEditor';
import NewsletterHeaderEditor from './NewsletterHeaderEditor';
import NewsletterFooterEditor from './NewsletterFooterEditor';
import { HeaderConfig, FooterConfig } from './types';

interface NewsletterEditorTabsProps {
  content: string;
  onContentChange: (content: string) => void;
  headerConfig: HeaderConfig;
  onHeaderConfigChange: (config: HeaderConfig) => void;
  footerConfig: FooterConfig;
  onFooterConfigChange: (config: FooterConfig) => void;
}

const NewsletterEditorTabs = ({
  content,
  onContentChange,
  headerConfig,
  onHeaderConfigChange,
  footerConfig,
  onFooterConfigChange
}: NewsletterEditorTabsProps) => {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="content" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Content
        </TabsTrigger>
        <TabsTrigger value="header" className="flex items-center gap-2">
          <Layout className="h-4 w-4" />
          Header
        </TabsTrigger>
        <TabsTrigger value="footer" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Footer
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <TipTapNewsletterEditor
              content={content}
              onChange={onContentChange}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="header" className="space-y-4">
        <NewsletterHeaderEditor
          headerConfig={headerConfig}
          onHeaderConfigChange={onHeaderConfigChange}
        />
      </TabsContent>

      <TabsContent value="footer" className="space-y-4">
        <NewsletterFooterEditor
          footerConfig={footerConfig}
          onFooterConfigChange={onFooterConfigChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default NewsletterEditorTabs;