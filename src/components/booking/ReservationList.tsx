import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReservations } from '@/hooks/useBookingData';
import { ReservationListProps } from '@/types/booking';
import { format, parseISO } from 'date-fns';
import { Calendar, User, Phone, Mail, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const ReservationList: React.FC<ReservationListProps> = ({
  propertyId,
  status,
  limit,
  onReservationClick
}) => {
  const { data: reservations, isLoading, error } = useReservations(propertyId, status);

  const displayReservations = limit ? reservations?.slice(0, limit) : reservations;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'active':
        return 'default';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading reservations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Reservations
          {status && (
            <Badge variant={getStatusColor(status)} className="capitalize">
              {status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!displayReservations?.length ? (
          <p className="text-muted-foreground text-center py-8">
            No reservations found
          </p>
        ) : (
          <div className="space-y-4">
            {displayReservations.map((reservation: any) => (
              <div
                key={reservation.id}
                className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onReservationClick?.(reservation)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{reservation.guest_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{reservation.guest_email}</span>
                    </div>
                    {reservation.guest_phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{reservation.guest_phone}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant={getStatusColor(reservation.status || 'pending')} className="capitalize">
                    {reservation.status || 'pending'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(parseISO(reservation.check_in_date), 'MMM dd')} - {format(parseISO(reservation.check_out_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    {reservation.guest_count || reservation.adults || 1} guest{(reservation.guest_count || reservation.adults || 1) !== 1 ? 's' : ''}
                  </div>
                </div>

                {reservation.total_amount && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: reservation.currency || 'USD'
                      }).format(reservation.total_amount)}
                    </span>
                  </div>
                )}

                {reservation.source_platform && (
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs capitalize">
                      {reservation.source_platform}
                    </Badge>
                    {reservation.external_booking_id && (
                      <span className="text-xs text-muted-foreground">
                        ID: {reservation.external_booking_id}
                      </span>
                    )}
                  </div>
                )}

                {reservation.special_requests && (
                  <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    <strong>Special Requests:</strong> {reservation.special_requests}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};