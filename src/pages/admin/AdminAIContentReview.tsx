
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentApprovalWorkflow from '@/components/admin/ContentApprovalWorkflow';
import UnifiedAIChat from '@/components/admin/UnifiedAIChat';

const AdminAIContentReview = () => {
  return (
    <AdminPageWrapper
      title="AI Content Management"
      description="Generate content with AI and manage the approval workflow"
    >
      <div className="p-6">
        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">AI Content Generation</TabsTrigger>
            <TabsTrigger value="approval">Content Approval</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <UnifiedAIChat />
          </TabsContent>

          <TabsContent value="approval" className="space-y-6">
            <ContentApprovalWorkflow />
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminAIContentReview;
