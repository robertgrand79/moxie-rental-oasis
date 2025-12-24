import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useReservations } from '@/hooks/useBookingData';
import { Search, Calendar, User, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Reservation data returned from the booking search
 */
interface FoundReservation {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  total_guests?: number;
  total_amount?: number;
  confirmation_code: string;
  status: string;
  notes?: string;
}

interface GuestReservationPortalProps {
  onReservationFound?: (reservation: FoundReservation) => void;
}

const GuestReservationPortal = ({ onReservationFound }: GuestReservationPortalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'confirmation' | 'email'>('confirmation');
  const [foundReservation, setFoundReservation] = useState<FoundReservation | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // This would typically search across all reservations, not just for a specific property
  const { data: allReservations } = useReservations();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API search delay
    setTimeout(() => {
      const reservation = allReservations?.find(r => {
        // Use last 8 characters of ID as confirmation code
        const confirmationCode = r.id.slice(-8).toUpperCase();
        if (searchType === 'confirmation') {
          return confirmationCode === searchQuery.toUpperCase();
        } else {
          return r.guest_email.toLowerCase() === searchQuery.toLowerCase();
        }
      });
      
      if (reservation) {
        // Generate confirmation code from ID (last 8 chars)
        const confirmationCode = reservation.id.slice(-8).toUpperCase();
        const foundRes: FoundReservation = {
          id: reservation.id,
          guest_name: reservation.guest_name,
          guest_email: reservation.guest_email,
          guest_phone: reservation.guest_phone ?? undefined,
          check_in_date: reservation.check_in_date,
          check_out_date: reservation.check_out_date,
          total_guests: reservation.guest_count,
          total_amount: reservation.total_amount,
          confirmation_code: confirmationCode,
          status: reservation.booking_status,
          notes: reservation.special_requests ?? undefined,
        };
        setFoundReservation(foundRes);
        onReservationFound?.(foundRes);
      } else {
        setFoundReservation(null);
      }
      
      setIsSearching(false);
    }, 1000);
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

  const renderReservationDetails = (reservation: FoundReservation) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reservation Found</h3>
        <Badge variant={getStatusBadgeVariant(reservation.status)}>
          {reservation.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{reservation.guest_name}</p>
              <p className="text-sm text-muted-foreground">Primary Guest</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{reservation.guest_email}</p>
              <p className="text-sm text-muted-foreground">Email</p>
            </div>
          </div>

          {reservation.guest_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{reservation.guest_phone}</p>
                <p className="text-sm text-muted-foreground">Phone</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {format(new Date(reservation.check_in_date), 'MMM d, yyyy')} - 
                {format(new Date(reservation.check_out_date), 'MMM d, yyyy')}
              </p>
              <p className="text-sm text-muted-foreground">Stay Dates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{reservation.total_guests || 1} guests</p>
              <p className="text-sm text-muted-foreground">Party Size</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{reservation.confirmation_code}</p>
              <p className="text-sm text-muted-foreground">Confirmation Code</p>
            </div>
          </div>
        </div>
      </div>

      {reservation.total_amount && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount</span>
            <span className="text-xl font-bold">${reservation.total_amount}</span>
          </div>
        </div>
      )}

      {reservation.notes && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Notes</h4>
          <p className="text-sm text-muted-foreground">{reservation.notes}</p>
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Your Reservation
        </CardTitle>
        <CardDescription>
          Look up your booking using your confirmation code or email address
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Search by</Label>
          <div className="flex gap-2">
            <Button
              variant={searchType === 'confirmation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('confirmation')}
            >
              Confirmation Code
            </Button>
            <Button
              variant={searchType === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('email')}
            >
              Email
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="search">
            {searchType === 'confirmation' ? 'Confirmation Code' : 'Email Address'}
          </Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              searchType === 'confirmation' 
                ? 'Enter your confirmation code (e.g., BK123456)' 
                : 'Enter your email address'
            }
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <Button 
          onClick={handleSearch} 
          disabled={!searchQuery.trim() || isSearching}
          className="w-full"
        >
          {isSearching ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search Reservation
            </>
          )}
        </Button>

        {foundReservation === null && searchQuery && !isSearching && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              No reservation found. Please check your {searchType === 'confirmation' ? 'confirmation code' : 'email address'} and try again.
            </p>
          </div>
        )}

        {foundReservation && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                View Reservation Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Reservation Details</DialogTitle>
                <DialogDescription>
                  Complete information for your booking
                </DialogDescription>
              </DialogHeader>
              {renderReservationDetails(foundReservation)}
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestReservationPortal;
