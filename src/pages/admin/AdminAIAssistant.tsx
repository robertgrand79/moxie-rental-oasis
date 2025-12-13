import React from 'react';
import { MessageSquare, Share2, Settings } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralChatTab from '@/components/admin/ai-assistant/GeneralChatTab';
import SocialMediaTab from '@/components/admin/ai-assistant/SocialMediaTab';
import AssistantSettingsTab from '@/components/admin/settings/AssistantSettingsTab';

const AdminAIAssistant = () => {
  return (
    <AdminPageWrapper
      title="Stay Moxie Assistant"
      description="Your AI-powered assistant for content, communication, and more"
    >
      <div className="p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">General Chat</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Social Media</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralChatTab />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaTab />
          </TabsContent>

          <TabsContent value="settings">
            <AssistantSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminAIAssistant;
