import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import MessageTemplatesTab from '@/components/guest-experience/MessageTemplatesTab';
import MessagingRulesTab from '@/components/guest-experience/MessagingRulesTab';
import ScheduledQueueTab from '@/components/guest-experience/ScheduledQueueTab';
import GuidebooksTab from '@/components/guest-experience/GuidebooksTab';
import { Clock, Send, FileText, Book } from 'lucide-react';

const GuestExperiencePage = () => {
  return (
    <AdminPageWrapper
      title="Guest Experience"
      description="Automate guest communications with scheduled messages and templates"
    >
      <div className="p-6">
        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="rules" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Rules</span>
              <span className="sm:hidden">Rules</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
              <span className="sm:hidden">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Queue</span>
              <span className="sm:hidden">Queue</span>
            </TabsTrigger>
            <TabsTrigger value="guidebooks" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span className="hidden sm:inline">Guidebooks</span>
              <span className="sm:hidden">Guides</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-6">
            <MessagingRulesTab />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <MessageTemplatesTab />
          </TabsContent>

          <TabsContent value="queue" className="mt-6">
            <ScheduledQueueTab />
          </TabsContent>

          <TabsContent value="guidebooks" className="mt-6">
            <GuidebooksTab />
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default GuestExperiencePage;
