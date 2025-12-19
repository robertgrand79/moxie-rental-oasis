import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SmartHomeDrawerProps { open: boolean; onOpenChange: (open: boolean) => void; }

const SmartHomeDrawer: React.FC<SmartHomeDrawerProps> = ({ open, onOpenChange }) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader className="border-b"><DrawerTitle>Smart Home</DrawerTitle><DrawerDescription>Locks & thermostats</DrawerDescription></DrawerHeader>
      <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
        <Card><CardHeader><CardTitle>Smart Home</CardTitle><CardDescription>Navigate to Settings → Smart Home for full configuration</CardDescription></CardHeader></Card>
      </ScrollArea>
    </DrawerContent>
  </Drawer>
);

export default SmartHomeDrawer;
