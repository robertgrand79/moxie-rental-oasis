import React from 'react';
import { MessageSquare, Share2, Zap } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralChatTab from '@/components/admin/ai-assistant/GeneralChatTab';
import SocialMediaTab from '@/components/admin/ai-assistant/SocialMediaTab';
import QuickPromptsTab from '@/components/admin/ai-assistant/QuickPromptsTab';

const AdminAIAssistant = () => {
  return (
    <AdminPageWrapper
      title="AI Assistant"
      description="Your AI-powered content and productivity hub"
    >
      <div className="p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              General Chat
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social Media
            </TabsTrigger>
            <TabsTrigger value="prompts" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Prompts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralChatTab />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaTab />
          </TabsContent>

          <TabsContent value="prompts">
            <QuickPromptsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminAIAssistant;
