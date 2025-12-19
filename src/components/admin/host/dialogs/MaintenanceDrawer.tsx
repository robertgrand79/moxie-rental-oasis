import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Wrench, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MaintenanceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MaintenanceDrawer = ({ open, onOpenChange }: MaintenanceDrawerProps) => {
  const navigate = useNavigate();
  
  const handleViewWorkOrders = () => {
    onOpenChange(false);
    navigate('/admin/work-orders');
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance
          </DrawerTitle>
          <DrawerDescription>
            Work orders and cleaning status
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Integration</CardTitle>
              <CardDescription>Work orders and cleaning status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Maintenance requests are automatically integrated with your existing work order system
                </p>
                <Button variant="outline" onClick={handleViewWorkOrders}>
                  View Work Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MaintenanceDrawer;
