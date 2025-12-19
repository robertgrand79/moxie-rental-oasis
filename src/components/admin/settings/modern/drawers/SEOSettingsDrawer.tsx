import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import SEOSettingsTab from '@/components/admin/settings/SEOSettingsTab';

interface SEOSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SEOSettingsDrawer: React.FC<SEOSettingsDrawerProps> = ({ open, onOpenChange }) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>SEO Settings</DrawerTitle>
          <DrawerDescription>Optimize your site for search engines</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
          <SEOSettingsTab />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default SEOSettingsDrawer;
