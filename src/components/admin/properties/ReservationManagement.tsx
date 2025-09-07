import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/property';
import { useReservations, useUpdateReservation } from '@/hooks/useBookingData';
import { Calendar, User, Phone, Mail, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ReservationManagementProps {
  property: Property;
}

const ReservationManagement = ({ property }: ReservationManagementProps) => {
  const { data: reservations, isLoading } = useReservations(property.id);
  const { mutate: updateReservation } = useUpdateReservation();
  const { toast } = useToast();

  const handleStatusUpdate = (reservationId: string, newStatus: string) => {
    updateReservation(
      { 
        id: reservationId, 
        updates: { status: newStatus } 
      },
      {
        onSuccess: () => {
          toast({
            title: "Reservation Updated",
            description: `Reservation status changed to ${newStatus}`,
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update reservation status",
            variant: "destructive",
          });
        }
      }
    );
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">Loading reservations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Reservation Management
        </CardTitle>
        <CardDescription>
          View and manage all reservations for {property.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!reservations || reservations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reservations found for this property</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{reservation.guest_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Confirmation: {reservation.confirmation_code}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(reservation.status)}>
                    {reservation.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Check-in</p>
                      <p>{format(new Date(reservation.check_in_date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Check-out</p>
                      <p>{format(new Date(reservation.check_out_date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Guests</p>
                      <p>{reservation.total_guests || 1}</p>
                    </div>
                  </div>

                  {reservation.total_amount && (
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 text-muted-foreground">$</span>
                      <div>
                        <p className="font-medium">Total</p>
                        <p>${reservation.total_amount}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {reservation.guest_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{reservation.guest_email}</span>
                    </div>
                  )}
                  {reservation.guest_phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{reservation.guest_phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  {reservation.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  )}
                  
                  {reservation.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(reservation.id, 'active')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Check In
                    </Button>
                  )}
                  
                  {reservation.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(reservation.id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Check Out
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationManagement;