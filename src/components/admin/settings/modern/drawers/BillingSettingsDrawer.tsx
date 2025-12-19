import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import BillingSubscriptionTab from '@/components/admin/organization/BillingSubscriptionTab';

interface BillingSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BillingSettingsDrawer: React.FC<BillingSettingsDrawerProps> = ({ open, onOpenChange }) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Billing & Subscription</DrawerTitle>
          <DrawerDescription>Manage your plan and payment method</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
          <BillingSubscriptionTab />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default BillingSettingsDrawer;
