import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ReservationData {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in_date: string;
  check_out_date: string;
  total_amount: number;
  booking_status: string;
  cleaning_status: string;
  properties: {
    title: string;
  };
}

interface RecentBookingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservations: ReservationData[];
  loading: boolean;
}

const RecentBookingsDrawer = ({ open, onOpenChange, reservations, loading }: RecentBookingsDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Bookings
          </DrawerTitle>
          <DrawerDescription>
            Latest booking activity across your properties
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-100px)]">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reservations</CardTitle>
              <CardDescription>Latest booking activity</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading reservations...</div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No reservations found</div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{reservation.guest_name}</p>
                            <Badge variant={reservation.booking_status === 'confirmed' ? 'default' : 'secondary'}>
                              {reservation.booking_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{reservation.properties.title}</p>
                          <p className="text-sm">
                            {format(new Date(reservation.check_in_date), 'MMM dd')} - {format(new Date(reservation.check_out_date), 'MMM dd')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${reservation.total_amount}</p>
                          <Badge 
                            variant={reservation.cleaning_status === 'completed' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            Cleaning: {reservation.cleaning_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default RecentBookingsDrawer;
