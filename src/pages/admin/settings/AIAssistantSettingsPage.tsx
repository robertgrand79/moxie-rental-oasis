import React from 'react';
import { Bot } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import AssistantSettingsTab from '@/components/admin/settings/AssistantSettingsTab';

const AIAssistantSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="AI Assistant" 
      description="Configure your AI assistant"
      icon={Bot}
    >
      <AssistantSettingsTab />
    </SettingsSidebarLayout>
  );
};

export default AIAssistantSettingsPage;
