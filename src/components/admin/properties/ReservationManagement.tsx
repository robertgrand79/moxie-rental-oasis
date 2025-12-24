import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/property';
import { useReservations, useUpdateReservation, useDeleteReservation } from '@/hooks/useBookingData';
import { Calendar, User, Phone, Mail, CheckCircle, XCircle, Loader2, AlertTriangle, DollarSign, RefreshCw } from 'lucide-react';
import { format, isAfter, isBefore, startOfToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReservationManagementProps {
  property: Property;
}

const ReservationManagement = ({ property }: ReservationManagementProps) => {
  const { data: reservations, isLoading, refetch } = useReservations(property.id);
  const { mutate: updateReservation, isPending: isUpdating } = useUpdateReservation();
  const { mutate: deleteReservation, isPending: isDeleting } = useDeleteReservation();
  const { toast } = useToast();
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'active' | 'past' | 'cancelled'>('upcoming');

  const handleStatusUpdate = (reservationId: string, newStatus: string) => {
    updateReservation(
      { 
        id: reservationId, 
        updates: { booking_status: newStatus } 
      },
      {
        onSuccess: () => {
          toast({
            title: "Reservation Updated",
            description: `Reservation status changed to ${newStatus}`,
          });
          refetch();
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

  const handleCancelClick = (reservationId: string) => {
    setSelectedReservationId(reservationId);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!selectedReservationId) return;
    
    deleteReservation(selectedReservationId, {
      onSuccess: () => {
        toast({
          title: "Booking Cancelled",
          description: "The reservation has been cancelled and the dates are now available.",
        });
        setCancelDialogOpen(false);
        setSelectedReservationId(null);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to cancel reservation. Please try again.",
          variant: "destructive",
        });
      }
    });
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

  const getPaymentBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'refunded':
        return 'secondary';
      case 'partially_refunded':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Filter reservations based on active filter
  const today = startOfToday();
  const filteredReservations = reservations?.filter(reservation => {
    const checkIn = new Date(reservation.check_in_date);
    const checkOut = new Date(reservation.check_out_date);
    
    switch (activeFilter) {
      case 'upcoming':
        return isAfter(checkIn, today) && reservation.booking_status !== 'cancelled';
      case 'active':
        return (isBefore(checkIn, today) || format(checkIn, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) 
          && isAfter(checkOut, today) 
          && reservation.booking_status !== 'cancelled';
      case 'past':
        return isBefore(checkOut, today) && reservation.booking_status !== 'cancelled';
      case 'cancelled':
        return reservation.booking_status === 'cancelled';
      default:
        return true;
    }
  }) || [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading reservations...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Reservation Management
              </CardTitle>
              <CardDescription>
                View and manage all reservations for {property.title}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)} className="mb-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No {activeFilter} reservations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div key={reservation.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{reservation.guest_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          #{reservation.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(reservation.booking_status)}>
                        {reservation.booking_status}
                      </Badge>
                      {reservation.payment_status && (
                        <Badge variant={getPaymentBadgeVariant(reservation.payment_status)}>
                          <DollarSign className="h-3 w-3 mr-1" />
                          {reservation.payment_status}
                        </Badge>
                      )}
                    </div>
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
                        <p>{reservation.guest_count || 1}</p>
                      </div>
                    </div>

                    {reservation.total_amount && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                        <a href={`mailto:${reservation.guest_email}`} className="hover:underline">
                          {reservation.guest_email}
                        </a>
                      </div>
                    )}
                    {reservation.guest_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${reservation.guest_phone}`} className="hover:underline">
                          {reservation.guest_phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {reservation.special_requests && (
                    <div className="bg-muted/50 p-2 rounded text-sm">
                      <span className="font-medium">Notes: </span>
                      {reservation.special_requests}
                    </div>
                  )}

                  {reservation.booking_status !== 'cancelled' && reservation.booking_status !== 'completed' && (
                    <div className="flex gap-2 pt-3 border-t">
                      {reservation.booking_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelClick(reservation.id)}
                            disabled={isDeleting}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {reservation.booking_status === 'confirmed' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(reservation.id, 'active')}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Check In
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelClick(reservation.id)}
                            disabled={isDeleting}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel Booking
                          </Button>
                        </>
                      )}
                      
                      {reservation.booking_status === 'active' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(reservation.id, 'completed')}
                          disabled={isUpdating}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Check Out
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Cancel Reservation?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel the reservation, release the blocked dates, and notify the guest. 
              If payment has been collected, you may need to process a refund separately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Reservation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReservationManagement;