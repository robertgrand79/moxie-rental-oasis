import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import LogoUploader from '@/components/LogoUploader';

interface BrandingSettingsDrawerProps { open: boolean; onOpenChange: (open: boolean) => void; }

const BrandingSettingsDrawer: React.FC<BrandingSettingsDrawerProps> = ({ open, onOpenChange }) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader className="border-b"><DrawerTitle>Branding</DrawerTitle><DrawerDescription>Logo & favicon</DrawerDescription></DrawerHeader>
      <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]"><LogoUploader /></ScrollArea>
    </DrawerContent>
  </Drawer>
);

export default BrandingSettingsDrawer;
