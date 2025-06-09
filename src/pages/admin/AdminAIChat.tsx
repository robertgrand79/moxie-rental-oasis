
import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import UnifiedAIChat from '@/components/admin/UnifiedAIChat';

const AdminAIChat = () => {
  return (
    <AdminPageWrapper
      title="AI Assistant"
      description="Converse with AI to generate and manage all your content"
    >
      <div className="p-6">
        <UnifiedAIChat />
      </div>
    </AdminPageWrapper>
  );
};

export default AdminAIChat;
