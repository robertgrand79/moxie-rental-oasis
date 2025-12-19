import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Settings } from 'lucide-react';
import GlobalNewsletterSettings from '@/components/admin/newsletter/GlobalNewsletterSettings';
import NewsletterSMSCard from '@/components/NewsletterSMSCard';

interface NewsletterSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsletterSettingsDrawer = ({ open, onOpenChange }: NewsletterSettingsDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Newsletter Settings
          </DrawerTitle>
          <DrawerDescription>
            Configure branding, integrations, and other newsletter settings
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)] space-y-6">
          <GlobalNewsletterSettings />
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">SMS Notifications</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Set up SMS notifications for your newsletter campaigns.
              </p>
              <NewsletterSMSCard />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewsletterSettingsDrawer;
