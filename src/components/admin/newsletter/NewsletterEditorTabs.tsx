import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import TipTapNewsletterEditor from './TipTapNewsletterEditor';

interface NewsletterEditorTabsProps {
  content: string;
  onContentChange: (content: string) => void;
}

const NewsletterEditorTabs = ({
  content,
  onContentChange,
}: NewsletterEditorTabsProps) => {
  const [activeTab, setActiveTab] = useState('content');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-1 h-12">
        <TabsTrigger value="content" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Content Editor
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            Create your newsletter content using the rich text editor. The header and footer are now configured globally in Settings.
          </p>
          <Card>
            <CardContent className="p-6">
              <TipTapNewsletterEditor
                content={content}
                onChange={onContentChange}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default NewsletterEditorTabs;