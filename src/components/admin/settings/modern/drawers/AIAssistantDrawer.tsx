import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import AssistantSettingsTab from '@/components/admin/settings/AssistantSettingsTab';

interface AIAssistantDrawerProps { open: boolean; onOpenChange: (open: boolean) => void; }

const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ open, onOpenChange }) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader className="border-b"><DrawerTitle>AI Assistant</DrawerTitle><DrawerDescription>Configure your AI assistant</DrawerDescription></DrawerHeader>
      <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]"><AssistantSettingsTab /></ScrollArea>
    </DrawerContent>
  </Drawer>
);

export default AIAssistantDrawer;
