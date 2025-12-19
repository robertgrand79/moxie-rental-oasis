import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import DomainSettingsTab from '@/components/admin/settings-hub/DomainSettingsTab';

interface DomainSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DomainSettingsDrawer: React.FC<DomainSettingsDrawerProps> = ({ open, onOpenChange }) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Domain Settings</DrawerTitle>
          <DrawerDescription>Configure your custom domain</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
          <DomainSettingsTab />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default DomainSettingsDrawer;
