import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CommunicationsDrawerProps { open: boolean; onOpenChange: (open: boolean) => void; }

const CommunicationsDrawer: React.FC<CommunicationsDrawerProps> = ({ open, onOpenChange }) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader className="border-b"><DrawerTitle>Communications</DrawerTitle><DrawerDescription>SMS & Email settings</DrawerDescription></DrawerHeader>
      <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
        <Card><CardHeader><CardTitle>Communications</CardTitle><CardDescription>Navigate to Settings → Communications for full configuration</CardDescription></CardHeader></Card>
      </ScrollArea>
    </DrawerContent>
  </Drawer>
);

export default CommunicationsDrawer;
