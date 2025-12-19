import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import ColorCustomizer from '@/components/ColorCustomizer';

interface ColorsSettingsDrawerProps { open: boolean; onOpenChange: (open: boolean) => void; }

const ColorsSettingsDrawer: React.FC<ColorsSettingsDrawerProps> = ({ open, onOpenChange }) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader className="border-b"><DrawerTitle>Colors</DrawerTitle><DrawerDescription>Customize your color palette</DrawerDescription></DrawerHeader>
      <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]"><ColorCustomizer /></ScrollArea>
    </DrawerContent>
  </Drawer>
);

export default ColorsSettingsDrawer;
