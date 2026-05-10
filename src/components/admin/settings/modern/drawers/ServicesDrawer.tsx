import React from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface ServicesDrawerProps { open: boolean; onOpenChange: (open: boolean) => void; }

const ServicesDrawer: React.FC<ServicesDrawerProps> = ({ open, onOpenChange }) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent className="max-h-[90vh]">
      <DrawerHeader className="border-b"><DrawerTitle>Services</DrawerTitle><DrawerDescription>Customer-owned service integrations</DrawerDescription></DrawerHeader>
      <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Turno is configured per organization. Customers should connect their own Turno API token and secret in
              Settings → Services.
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>Services</CardTitle>
              <CardDescription>
                Navigate to Settings → Services to save the organization&apos;s own Turno credentials and optional partner ID.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Turno sync, property fetch, and connection testing stay disabled until that organization has its own Turno setup saved.
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </DrawerContent>
  </Drawer>
);

export default ServicesDrawer;
