import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Users } from 'lucide-react';
import NewsletterSubscribersList from '@/components/newsletter/NewsletterSubscribersList';

interface NewsletterSubscribersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewsletterSubscribersDrawer = ({ open, onOpenChange }: NewsletterSubscribersDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subscriber Management
          </DrawerTitle>
          <DrawerDescription>
            Manage your newsletter subscribers and import new contacts
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          <NewsletterSubscribersList />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default NewsletterSubscribersDrawer;
