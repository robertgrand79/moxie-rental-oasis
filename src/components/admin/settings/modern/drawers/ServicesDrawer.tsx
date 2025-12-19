import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServicesDrawerProps { open: boolean; onOpenChange: (open: boolean) => void; }

const ServicesDrawer: React.FC<ServicesDrawerProps> = ({ open, onOpenChange }) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader className="border-b"><DrawerTitle>Services</DrawerTitle><DrawerDescription>Third-party services</DrawerDescription></DrawerHeader>
      <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
        <Card><CardHeader><CardTitle>Services</CardTitle><CardDescription>Navigate to Settings → Services for full configuration</CardDescription></CardHeader></Card>
      </ScrollArea>
    </DrawerContent>
  </Drawer>
);

export default ServicesDrawer;
