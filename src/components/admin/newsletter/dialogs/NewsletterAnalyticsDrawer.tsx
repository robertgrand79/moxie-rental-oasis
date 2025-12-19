import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { TrendingUp } from 'lucide-react';
import NewsletterAnalyticsTab from '@/components/admin/newsletter/NewsletterAnalyticsTab';

interface NewsletterAnalyticsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsletterAnalyticsDrawer = ({ open, onOpenChange }: NewsletterAnalyticsDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Newsletter Analytics
          </DrawerTitle>
          <DrawerDescription>
            Track performance and engagement metrics
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          <NewsletterAnalyticsTab />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewsletterAnalyticsDrawer;
