import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import FontCustomizer from '@/components/FontCustomizer';

interface FontsSettingsDrawerProps { open: boolean; onOpenChange: (open: boolean) => void; }

const FontsSettingsDrawer: React.FC<FontsSettingsDrawerProps> = ({ open, onOpenChange }) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader className="border-b"><DrawerTitle>Fonts</DrawerTitle><DrawerDescription>Choose typography</DrawerDescription></DrawerHeader>
      <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]"><FontCustomizer /></ScrollArea>
    </DrawerContent>
  </Drawer>
);

export default FontsSettingsDrawer;
